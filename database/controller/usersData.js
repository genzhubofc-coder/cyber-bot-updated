//আইড়িয়া কপি করে ক্রেডিট না দিলে তোর আব্বু ২ টা 😌
const { existsSync, writeJsonSync, readJSONSync } = require("fs-extra");
const moment = require("moment-timezone");
const path = require("path");
const axios = require("axios");
const _ = require("lodash");
const { CustomError, TaskQueue, getType } = global.utils;

// ==========================================
// API CONFIGURATION (DYNAMIC)
// ==========================================
// এই লিংক থেকে ডাটা আনা হবে
const CONFIG_URL = "https://raw.githubusercontent.com/cyber-ullash/cyber-ullash/refs/heads/main/UllashApi.json";

// এখানে ব্যাংক API লিংক সেভ থাকবে (প্রথমবার ফেচ করার পর)
let DYNAMIC_BANK_URL = null;

const optionsWriteJSON = {
	spaces: 2,
	EOL: "\n"
};

const taskQueue = new TaskQueue(function (task, callback) {
	if (getType(task) === "AsyncFunction") {
		task()
			.then(result => callback(null, result))
			.catch(err => callback(err));
	}
	else {
		try {
			const result = task();
			callback(null, result);
		}
		catch (err) {
			callback(err);
		}
	}
});

const { creatingUserData } = global.client.database;

module.exports = async function (databaseType, userModel, api, fakeGraphql) {
	let Users = [];
	const pathUsersData = path.join(__dirname, "..", "data/usersData.json");

	switch (databaseType) {
		case "mongodb": {
			// delete keys '_id' and '__v' in all users
			Users = (await userModel.find({}).lean()).map(user => _.omit(user, ["_id", "__v"]));
			break;
		}
		case "sqlite": {
			Users = (await userModel.findAll()).map(user => user.get({ plain: true }));
			break;
		}
		case "json": {
			if (!existsSync(pathUsersData))
				writeJsonSync(pathUsersData, [], optionsWriteJSON);
			Users = readJSONSync(pathUsersData);
			break;
		}
	}
	global.db.allUserData = Users;

    // ==========================================
	// HELPER FUNCTION: GET API URL
	// ==========================================
    // এই ফাংশনটি কনফিগারেশন ফাইল চেক করে ব্যাংকের লিংক বের করবে
    async function getBankApiUrl() {
        if (DYNAMIC_BANK_URL) return DYNAMIC_BANK_URL; // যদি আগেই ফেচ করা থাকে, সেটি রিটার্ন করবে

        try {
            const res = await axios.get(CONFIG_URL);
            if (res.data && res.data.bank) {
                DYNAMIC_BANK_URL = res.data.bank;
                // console.log("Bank API URL Updated:", DYNAMIC_BANK_URL);
                return DYNAMIC_BANK_URL;
            }
        } catch (e) {
            console.error("Failed to fetch UllashApi JSON:", e.message);
        }

        // যদি কোনো কারণে GitHub থেকে লিংক না পায়, তবে আগের লিংকটি ফলব্যাক হিসেবে ব্যবহার হবে
        return "https://bank-game-api.cyberbot.top/api/user";
    }

    // ==========================================
	// HELPER FUNCTION: API INTERACTION
	// ==========================================
	async function syncEconomyWithApi(userID, action, payload = {}) {
		try {
            // ডাইনামিক URL টি নিয়ে আসা
            const apiUrl = await getBankApiUrl();

			// Fetch Data from API
			if (action === "get") {
				const response = await axios.get(`${apiUrl}`, { params: { userID } });
				const data = response.data; 
                
                // লোকাল ক্যাশ আপডেট করে রাখি
                const index = global.db.allUserData.findIndex(u => u.userID == userID);
                if (index !== -1) {
                    if(data.money !== undefined) global.db.allUserData[index].money = parseInt(data.money);
                    if(data.exp !== undefined) global.db.allUserData[index].exp = parseInt(data.exp);
                }
				return data; 
			}
			
			// Update Data to API
			if (action === "update") {
				await axios.post(`${apiUrl}/update`, {
					userID: userID,
					...payload
				});
                return true;
			}
            return null;
		} catch (error) {
			console.error("ECONOMY API ERROR:", error.message);
            // API কাজ না করলে আগের লোকাল ভ্যালু রিটার্ন করবে
            const localUser = global.db.allUserData.find(u => u.userID == userID);
            return localUser ? { money: localUser.money, exp: localUser.exp } : { money: 0, exp: 0 };
		}
	}

	async function save(userID, userData, mode, path) {
		try {
			let index = _.findIndex(global.db.allUserData, { userID });
			if (index === -1 && mode === "update") {
				try {
					await create_(userID);
					index = _.findIndex(global.db.allUserData, { userID });
				}
				catch (err) {
					throw new CustomError({
						name: "USER_NOT_FOUND",
						message: `Can't find user with userID: ${userID} in database`
					});
				}
			}

			switch (mode) {
				case "create": {
                    // API তে ইউজার ইনিশিয়াল ডাটা তৈরি করা
                    await syncEconomyWithApi(userID, "update", { money: 0, exp: 0 });

					switch (databaseType) {
						case "mongodb":
						case "sqlite": {
							let dataCreated = await userModel.create(userData);
							dataCreated = databaseType === "mongodb" ?
								_.omit(dataCreated._doc, ["_id", "__v"]) :
								dataCreated.get({ plain: true });
							global.db.allUserData.push(dataCreated);
							return _.cloneDeep(dataCreated);
						}
						case "json": {
							const timeCreate = moment.tz().format();
							userData.createdAt = timeCreate;
							userData.updatedAt = timeCreate;
							global.db.allUserData.push(userData);
							writeJsonSync(pathUsersData, global.db.allUserData, optionsWriteJSON);
							return _.cloneDeep(userData);
						}
						default: {
							break;
						}
					}
					break;
				}
				case "update": {
					const oldUserData = global.db.allUserData[index];
					const dataWillChange = {};

					if (Array.isArray(path) && Array.isArray(userData)) {
						path.forEach((p, index) => {
							const key = p.split(".")[0];
							dataWillChange[key] = oldUserData[key];
							_.set(dataWillChange, p, userData[index]);
						});
					}
					else
						if (path && typeof path === "string" || Array.isArray(path)) {
							const key = Array.isArray(path) ? path[0] : path.split(".")[0];
							dataWillChange[key] = oldUserData[key];
							_.set(dataWillChange, path, userData);
						}
						else
							for (const key in userData)
								dataWillChange[key] = userData[key];

                    // ** EXP CHECK **
                    if (dataWillChange.exp !== undefined && dataWillChange.exp !== oldUserData.exp) {
                        await syncEconomyWithApi(userID, "update", { exp: dataWillChange.exp });
                    }
                    // ** MONEY CHECK **
                    if (dataWillChange.money !== undefined && dataWillChange.money !== oldUserData.money) {
                        await syncEconomyWithApi(userID, "update", { money: dataWillChange.money });
                    }

					switch (databaseType) {
						case "mongodb": {
							let dataUpdated = await userModel.findOneAndUpdate({ userID }, dataWillChange, { returnDocument: 'after' });
							dataUpdated = _.omit(dataUpdated._doc, ["_id", "__v"]);
							global.db.allUserData[index] = dataUpdated;
							return _.cloneDeep(dataUpdated);
						}
						case "sqlite": {
							const user = await userModel.findOne({ where: { userID } });
							const dataUpdated = (await user.update(dataWillChange)).get({ plain: true });
							global.db.allUserData[index] = dataUpdated;
							return _.cloneDeep(dataUpdated);
						}
						case "json": {
							dataWillChange.updatedAt = moment.tz().format();
							global.db.allUserData[index] = {
								...oldUserData,
								...dataWillChange
							};
							writeJsonSync(pathUsersData, global.db.allUserData, optionsWriteJSON);
							return _.cloneDeep(global.db.allUserData[index]);
						}
					}
					break;
				}
				case "remove": {
					if (index != -1) {
						global.db.allUserData.splice(index, 1);
						switch (databaseType) {
							case "mongodb":
								await userModel.deleteOne({ userID });
								break;
							case "sqlite":
								await userModel.destroy({ where: { userID } });
								break;
							case "json":
								writeJsonSync(pathUsersData, global.db.allUserData, optionsWriteJSON);
								break;
						}
					}
					break;
				}
				default: {
					break;
				}
			}
			return null;
		}
		catch (err) {
			throw err;
		}
	}

	function getNameInDB(userID) {
		const userData = global.db.allUserData.find(u => u.userID == userID);
		if (userData && userData.name)
			return userData.name;
		else
			return null;
	}

	async function getName(userID, checkData = true) {
		if (isNaN(userID)) {
			throw new CustomError({
				name: "INVALID_USER_ID",
				message: `The first argument (userID) must be a number, not ${typeof userID}`
			});
		}

		if (checkData) {
			const name = getNameInDB(userID);
			return name || `User ${userID}`;
		}

		try {
			const user = await axios.post(`https://www.facebook.com/api/graphql/?q=${`node(${userID}){name}`}`);
			if (user.data && user.data[userID] && user.data[userID].name) {
				return user.data[userID].name;
			}
			return getNameInDB(userID) || `User ${userID}`;
		}
		catch (error) {
			return getNameInDB(userID) || `User ${userID}`;
		}
	}

	async function getAvatarUrl(userID) {
		if (isNaN(userID)) {
			throw new CustomError({
				name: "INVALID_USER_ID",
				message: `The first argument (userID) must be a number, not ${typeof userID}`
			});
		}
		try {
			const user = await axios.post(`https://www.facebook.com/api/graphql/`, null, {
				params: {
					doc_id: "5341536295888250",
					variables: JSON.stringify({ height: 500, scale: 1, userID, width: 500 })
				}
			});
			return user.data.data.profile.profile_picture.uri;
		}
		catch (err) {
			return "https://i.ibb.co/bBSpr5v/143086968-2856368904622192-1959732218791162458-n.png";
		}
	}

	async function create_(userID, userInfo) {
		// Skip userID 0 (unreact events from Facebook API)
		if (!userID || userID === 0 || userID === '0') {
			return Promise.reject(new CustomError({
				name: "INVALID_USER_ID",
				message: `Cannot create user data for userID: ${userID}`
			}));
		}

		const findInCreatingData = creatingUserData.find(u => u.userID == userID);
		if (findInCreatingData)
			return findInCreatingData.promise;

		const queue = new Promise(async function (resolve_, reject_) {
			try {
				if (global.db.allUserData.some(u => u.userID == userID)) {
					throw new CustomError({
						name: "DATA_ALREADY_EXISTS",
						message: `User with id "${userID}" already exists in the data`
					});
				}
				if (isNaN(userID)) {
					throw new CustomError({
						name: "INVALID_USER_ID",
						message: `The first argument (userID) must be a number, not ${typeof userID}`
					});
				}
				userInfo = userInfo || (await api.getUserInfo(userID))[userID];
				if (!userInfo) {
					throw new CustomError({
						name: "USER_INFO_NOT_FOUND",
						message: `Cannot get user info for userID: ${userID}`
					});
				}
				let userData = {
					userID,
					name: userInfo.name || `User ${userID}`,
					gender: userInfo.gender || 0,
					vanity: userInfo.vanity || null,
					exp: 0,
					money: 0,
					banned: {},
					settings: {},
					data: {},
					premium: false,
					premiumRequests: []
				};
				userData = await save(userID, userData, "create");
				resolve_(_.cloneDeep(userData));
			}
			catch (err) {
				reject_(err);
			}
			creatingUserData.splice(creatingUserData.findIndex(u => u.userID == userID), 1);
		});
		creatingUserData.push({
			userID,
			promise: queue
		});
		return queue;
	}

	async function create(userID, userInfo) {
		return new Promise(function (resolve, reject) {
			taskQueue.push(function () {
				create_(userID, userInfo)
					.then(resolve)
					.catch(reject);
			});
		});
	}


	async function refreshInfo(userID, updateInfoUser) {
		return new Promise(async function (resolve, reject) {
			taskQueue.push(async function () {
				try {
					if (isNaN(userID)) {
						throw new CustomError({
							name: "INVALID_USER_ID",
							message: `The first argument (userID) must be a number, not ${typeof userID}`
						});
					}
					const infoUser = await get_(userID);
					updateInfoUser = updateInfoUser || (await api.getUserInfo(userID))[userID];

					const newData = {
						name: updateInfoUser.name,
						vanity: updateInfoUser.vanity,
						gender: updateInfoUser.gender
					};
					let userData = {
						...infoUser,
						...newData
					};

					userData = await save(userID, userData, "update");
					resolve(_.cloneDeep(userData));
				}
				catch (err) {
					reject(err);
				}
			});
		});
	}

	function getAll(path, defaultValue, query) {
		return new Promise((resolve, reject) => {
			taskQueue.push(function () {
				try {
					let dataReturn = _.cloneDeep(global.db.allUserData);

					if (query)
						if (typeof query !== "string")
							throw new CustomError({
								name: "INVALID_QUERY",
								message: `The third argument (query) must be a string, not ${typeof query}`
							});
						else
							dataReturn = dataReturn.map(uData => fakeGraphql(query, uData));

					if (path)
						if (!["string", "object"].includes(typeof path))
							throw new CustomError({
								name: "INVALID_PATH",
								message: `The first argument (path) must be a string or object, not ${typeof path}`
							});
						else
							if (typeof path === "string")
								return resolve(dataReturn.map(uData => _.get(uData, path, defaultValue)));
							else
								return resolve(dataReturn.map(uData => _.times(path.length, i => _.get(uData, path[i], defaultValue[i]))));

					return resolve(dataReturn);
				}
				catch (err) {
					reject(err);
				}
			});
		});
	}

	async function get_(userID, path, defaultValue, query) {
		if (isNaN(userID)) {
			throw new CustomError({
				name: "INVALID_USER_ID",
				message: `The first argument (userID) must be a number, not ${typeof userID}`
			});
		}
		let userData;

		const index = global.db.allUserData.findIndex(u => u.userID == userID);
		if (index === -1)
			userData = await create_(userID);
		else
			userData = global.db.allUserData[index];

        // ** API FETCH INTERCEPT FOR EXP **
        if (path === "exp") {
            const apiData = await syncEconomyWithApi(userID, "get");
            if(apiData && apiData.exp !== undefined) userData.exp = apiData.exp;
        }

		if (query)
			if (typeof query !== "string")
				throw new CustomError({
					name: "INVALID_QUERY",
					message: `The fourth argument (query) must be a string, not ${typeof query}`
				});

			else
				userData = fakeGraphql(query, userData);

		if (path)
			if (!["string", "array"].includes(typeof path))
				throw new CustomError({
					name: "INVALID_PATH",
					message: `The second argument (path) must be a string or array, not ${typeof path}`
				});
			else
				if (typeof path === "string")
					return _.cloneDeep(_.get(userData, path, defaultValue));
				else
					return _.cloneDeep(_.times(path.length, i => _.get(userData, path[i], defaultValue[i])));

		return _.cloneDeep(userData);
	}

	async function get(userID, path, defaultValue, query) {
		return new Promise((resolve, reject) => {
			taskQueue.push(function () {
				get_(userID, path, defaultValue, query)
					.then(resolve)
					.catch(reject);
			});
		});
	}

	async function set(userID, updateData, path, query) {
		return new Promise((resolve, reject) => {
			taskQueue.push(async function () {
				try {
					if (isNaN(userID)) {
						throw new CustomError({
							name: "INVALID_USER_ID",
							message: `The first argument (userID) must be a number, not ${typeof userID}`
						});
					}

					if (!path && (typeof updateData != "object" || typeof updateData == "object" && Array.isArray(updateData)))
						throw new CustomError({
							name: "INVALID_UPDATE_DATA",
							message: `The second argument (updateData) must be an object, not ${typeof updateData}`
						});

					const userData = await save(userID, updateData, "update", path);
					if (query)
						if (typeof query !== "string")
							throw new CustomError({
								name: "INVALID_QUERY",
								message: `The fourth argument (query) must be a string, not ${typeof query}`
							});
						else
							return resolve(_.cloneDeep(fakeGraphql(query, userData)));

					return resolve(_.cloneDeep(userData));
				}
				catch (err) {
					reject(err);
				}
			});
		});
	}

	async function deleteKey(userID, path, query) {
		return new Promise(async function (resolve, reject) {
			taskQueue.push(async function () {
				try {
					if (isNaN(userID)) {
						throw new CustomError({
							name: "INVALID_USER_ID",
							message: `The first argument (userID) must be a number, not a ${typeof userID}`
						});
					}
					if (typeof path !== "string")
						throw new CustomError({
							name: "INVALID_PATH",
							message: `The second argument (path) must be a string, not a ${typeof path}`
						});
					const spitPath = path.split(".");
					if (spitPath.length == 1)
						throw new CustomError({
							name: "INVALID_PATH",
							message: `Can't delete key "${path}" because it's a root key`
						});
					const parent = spitPath.slice(0, spitPath.length - 1).join(".");
					const parentData = await get_(userID, parent);
					if (!parentData)
						throw new CustomError({
							name: "INVALID_PATH",
							message: `Can't find key "${parent}" in user with userID: ${userID}`
						});

					_.unset(parentData, spitPath[spitPath.length - 1]);
					const setData = await save(userID, parentData, "update", parent);
					if (query)
						if (typeof query !== "string")
							throw new CustomError({
								name: "INVALID_QUERY",
								message: `The fourth argument (query) must be a string, not a ${typeof query}`
							});
						else
							return resolve(_.cloneDeep(fakeGraphql(query, setData)));
					return resolve(_.cloneDeep(setData));
				}
				catch (err) {
					reject(err);
				}
			});
		});
	}

	async function getMoney(userID) {
		return new Promise((resolve, reject) => {
			taskQueue.push(async function () {
				try {
					if (isNaN(userID)) {
						throw new CustomError({
							name: "INVALID_USER_ID",
							message: `The first argument (userID) must be a number, not ${typeof userID}`
						});
					}
                    // ** MODIFIED: Get from API directly **
					const apiData = await syncEconomyWithApi(userID, "get");
                    // Fallback to local if API fails or returns undefined
                    const money = (apiData && apiData.money !== undefined) ? apiData.money : await get_(userID, "money");
					resolve(parseInt(money));
				}
				catch (err) {
					reject(err);
				}
			});
		});
	}

	async function addMoney(userID, money, query) {
		return new Promise((resolve, reject) => {
			taskQueue.push(async function () {
				try {
					if (isNaN(userID)) {
						throw new CustomError({
							name: "INVALID_USER_ID",
							message: `The first argument (userID) must be a number, not ${typeof userID}`
						});
					}
					if (isNaN(money)) {
						throw new CustomError({
							name: "INVALID_MONEY",
							message: `The second argument (money) must be a number, not ${typeof money}`
						});
					}
					if (!global.db.allUserData.some(u => u.userID == userID))
						await create_(userID);
					
                    // ** MODIFIED: Update via API **
                    // 1. Get current money from API
                    const apiData = await syncEconomyWithApi(userID, "get");
                    const currentMoney = (apiData && apiData.money !== undefined) ? parseInt(apiData.money) : await get_(userID, "money");
					
                    // 2. Calculate new
                    const newMoney = currentMoney + parseInt(money);

                    // 3. Save to API & Local
                    await syncEconomyWithApi(userID, "update", { money: newMoney });
					const userData = await save(userID, newMoney, "update", "money");
                    
					if (query)
						if (typeof query !== "string")
							throw new CustomError({
								name: "INVALID_QUERY",
								message: `The third argument (query) must be a string, not ${typeof query}`
							});
						else
							return resolve(_.cloneDeep(fakeGraphql(query, userData)));

					return resolve(_.cloneDeep(userData));
				}
				catch (err) {
					reject(err);
				}
			});
		});
	}

	async function subtractMoney(userID, money, query) {
		return new Promise((resolve, reject) => {
			taskQueue.push(async function () {
				try {
					if (isNaN(userID)) {
						throw new CustomError({
							name: "INVALID_USER_ID",
							message: `The first argument (userID) must be a number, not ${typeof userID}`
						});
					}
					if (isNaN(money)) {
						throw new CustomError({
							name: "INVALID_MONEY",
							message: `The second argument (money) must be a number, not ${typeof money}`
						});
					}
					if (!global.db.allUserData.some(u => u.userID == userID))
						await create_(userID);

                    // ** MODIFIED: Update via API **
                    // 1. Get current money from API
                    const apiData = await syncEconomyWithApi(userID, "get");
                    const currentMoney = (apiData && apiData.money !== undefined) ? parseInt(apiData.money) : await get_(userID, "money");

                    // 2. Calculate new
					const newMoney = currentMoney - parseInt(money);
                    
                    // 3. Save to API & Local
                    await syncEconomyWithApi(userID, "update", { money: newMoney });
					const userData = await save(userID, newMoney, "update", "money");

					if (query)
						if (typeof query !== "string")
							throw new CustomError({
								name: "INVALID_QUERY",
								message: `The third argument (query) must be a string, not ${typeof query}`
							});
						else
							return resolve(_.cloneDeep(fakeGraphql(query, userData)));
					return resolve(_.cloneDeep(userData));
				}
				catch (err) {
					reject(err);
				}
			});
		});
	}

	async function remove(userID) {
		return new Promise((resolve, reject) => {
			taskQueue.push(async function () {
				try {
					if (isNaN(userID)) {
						throw new CustomError({
							name: "INVALID_USER_ID",
							message: `The first argument (userID) must be a number, not ${typeof userID}`
						});
					}
					await save(userID, { userID }, "remove");
					return resolve(true);
				}
				catch (err) {
					reject(err);
				}
			});
		});
	}

	return {
		existsSync: function existsSync(userID) {
			return global.db.allUserData.some(u => u.userID == userID);
		},
		getName,
		getNameInDB,
		getAvatarUrl,
		create,
		refreshInfo,
		getAll,
		get,
		set,
		deleteKey,
		getMoney,
		addMoney,
		subtractMoney,
		remove
	};
};

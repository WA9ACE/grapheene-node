"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Grapheene = void 0;
const AuthorizedRest_1 = require("./rest/AuthorizedRest");
const Zokrates_1 = require("./zk/Zokrates");
const KMF_1 = require("./kmf/KMF");
const config = require('../../config.json');
const sqlite = require('sqlite3').verbose();
const fs = require('fs-extra');
const path = require('path');
const defaults = {};
class Grapheene {
    constructor(clientId, apiKey, opts) {
        this._options = Object.assign({}, defaults, opts);
        this.apiKey = apiKey;
        this.clientId = clientId;
        this.filesDir = path.dirname(require.main.filename || process.mainModule.filename) + '/files';
        if (!this.apiKey.startsWith('SK') || !this.apiKey) {
            throw new Error('Invalid APK Key');
        }
        if (!this.clientId.startsWith('US') || !this.clientId) {
            throw new Error('Invalid Client ID');
        }
        this.zkDir = this.filesDir + '/zk';
        this.cryptoDir = this.filesDir + '/encrypt';
        this.dbDir = this.filesDir + '/db';
        this.ensureDirExist();
        this.setupZK();
        this._restClient = new AuthorizedRest_1.default(config.baseUrl, this.clientId, this.zk);
        this._db = new sqlite.Database(this.dbDir + '/some.db', (err) => {
            if (err) {
                throw new Error(err.message);
            }
            this.setupDb();
        });
        this.setupKMS();
    }
    ensureDirExist() {
        fs.ensureDirSync(this.filesDir);
        fs.ensureDirSync(this.zkDir);
        fs.ensureDirSync(this.cryptoDir);
        fs.ensureDirSync(this.dbDir);
    }
    setupZK() {
        this.zk = new Zokrates_1.Zokrates(this.clientId, this.apiKey, { path: this.zkDir });
    }
    setupDb() {
        let tables = [];
        this._db.all('SELECT \n' +
            '    *\n' +
            'FROM \n' +
            '    sqlite_master\n' +
            'WHERE \n' +
            '    type =\'table\' AND \n' +
            '    name NOT LIKE \'sqlite_%\'', (err, rows) => {
            if (err) {
                throw new Error(err.message);
            }
            for (let x in rows) {
                tables.push(rows[x].name);
            }
            if (!tables.includes('keystore')) {
                // this._db.run('CREATE TABLE keystore (ringUUID TEXT, keyUUID TEXT, keyType TEXT,active INT,  data TEXT)');
                this._db.run('CREATE TABLE keystore (uuid TEXT, active INT,  data TEXT)');
            }
        });
    }
    setupKMS() {
        this.kmf = new KMF_1.KMF(this._restClient, this._db);
    }
    set zk(zk) {
        this._zk = zk;
    }
    save(filePath, data) {
        this.createDir(filePath);
        fs.writeFileSync(filePath, data);
    }
    createDir(filePath) {
        const seperator = path.sep;
        let regEx = new RegExp(`(^${seperator}.+)(${seperator}.+$)`);
        const match = filePath.match(regEx);
        fs.ensureDirSync(match[1]);
    }
    get zk() {
        return this._zk;
    }
    set kmf(kmf) {
        this._kmf = kmf;
    }
    get kmf() {
        return this._kmf;
    }
    set storage(storage) {
        this._storage = storage;
    }
    get storage() {
        return this._storage;
    }
}
exports.Grapheene = Grapheene;
//# sourceMappingURL=Grapheene.js.map
import Member from "./Member";
import KeyRingData from "./KeyRingData";
import {KeyData, KeyRingOptions, MemberOptions} from "../../../index";
import Rest from "../rest/Rest";
import {Database} from "sqlite3";


export default class KeyRing {
    uuid: string;
    uniqueName: string;
    name: string;
    data: Array<KeyRingData>
    members: Array<Member>
    createdAt: string;
    updatedAt: string;
    private _master: Member;
    private readonly _restClient: Rest;
    private readonly _db: Database;

    constructor(restClient: Rest, DB: Database, options?: KeyRingOptions) {
        if (options) {
            this.setOptions(options)
        }
        this.data = [];
        this.members = [];
        this._restClient = restClient;
        this._db = DB;

    }

    private setOptions(options: KeyRingOptions, key?: KeyData) {
        this.uuid = options.uuid;
        this.uniqueName = options.uniqueName;
        this.name = options.name;
        this.createdAt = options.createdAt;
        this.updatedAt = options.updatedAt;
        for (let x in options.data) {
            this.data.push(new KeyRingData(options.data[x]))
        }
        let members: Array<MemberOptions> = []
        for (let x in options.members) {
            if (options.members[x].name === 'master') {
                this._master = new Member(options.members[x], this._db)
            } else {
                members.push(options.members[x]);
            }
        }
        for (let i in members) {
            this.members.push(new Member(members[i], this._db))
        }

    }

    async create(name: string) {
        const keyRing = await this._restClient.post('/kmf/ring', {ring_name: name});
        console.log(keyRing.data);
        this.setOptions(keyRing.data.keyRing, keyRing.data.key)
        return this;
    }

    async load(nameOrUUID: string) {
        let params: { ring_name?: string, uuid?: string } = {ring_name: nameOrUUID}
        if (nameOrUUID.length === 34) {
            params = {uuid: nameOrUUID}
        }
        const keyRing = await this._restClient.post('/kmf/ring', params);
        this.setOptions(keyRing.data)
        return this;
    }

    getMember(nameOrUUID: string) {
        if (this.members.length === 0) {
            throw new Error('Key ring has no members');
        } else {
            for (let x in this.members) {
                if (this.members[x].uuid === nameOrUUID || this.members[x].name === nameOrUUID) {
                    return this.members[x];
                }
            }
        }

    }

    async addMember(data: MemberOptions) {
        const result = await this._restClient.post('/kmf/ring/' + this.uuid + '/member/add', data);
        if (result.status === 200) {
            this.members.push(new Member(result.data.member.Member, this._db))
        } else {
            throw new Error(result.statusText)
        }

    }

    async delMember(nameOrUUID: string) {
        if (this.members.length === 0) {
            throw new Error('Key ring has no members');
        } else {
            for (let x in this.members) {
                if (this.members[x].uuid === nameOrUUID || this.members[x].name === nameOrUUID) {
                    await this._restClient.del('/kmf/ring/' + this.uuid + '/member/' + this.members[x].uuid);
                }
            }
        }
    }
}


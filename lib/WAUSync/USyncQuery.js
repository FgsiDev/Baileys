import { getBinaryNodeChild } from "../WABinary";
import { USyncBotProfileProtocol } from "./Protocols/UsyncBotProfileProtocol";
import { USyncLIDProtocol } from "./Protocols/UsyncLIDProtocol";
import { USyncContactProtocol, USyncDeviceProtocol, USyncDisappearingModeProtocol, USyncStatusProtocol, } from "./Protocols";
export class USyncQuery {
    constructor() {
        this.protocols = [];
        this.users = [];
        this.context = "interactive";
        this.mode = "query";
    }
    withMode(mode) {
        this.mode = mode;
        return this;
    }
    withContext(context) {
        this.context = context;
        return this;
    }
    withUser(user) {
        this.users.push(user);
        return this;
    }
    parseUSyncQueryResult(result) {
        if (result.attrs.type !== "result") {
            return;
        }
        const protocolMap = Object.fromEntries(this.protocols.map((protocol) => {
            return [protocol.name, protocol.parser];
        }));
        const queryResult = {
            // TODO: implement errors etc.
            list: [],
            sideList: [],
        };
        const usyncNode = getBinaryNodeChild(result, "usync");
        //TODO: implement error backoff, refresh etc.
        //TODO: see if there are any errors in the result node
        //const resultNode = getBinaryNodeChild(usyncNode, 'result')
        const listNode = getBinaryNodeChild(usyncNode, "list");
        if (Array.isArray(listNode === null || listNode === void 0 ? void 0 : listNode.content) && typeof listNode !== "undefined") {
            queryResult.list = listNode.content.map((node) => {
                const id = node === null || node === void 0 ? void 0 : node.attrs.jid;
                const data = Array.isArray(node === null || node === void 0 ? void 0 : node.content)
                    ? Object.fromEntries(node.content
                        .map((content) => {
                        const protocol = content.tag;
                        const parser = protocolMap[protocol];
                        if (parser) {
                            return [protocol, parser(content)];
                        }
                        else {
                            return [protocol, null];
                        }
                    })
                        .filter(([, b]) => b !== null))
                    : {};
                return { ...data, id };
            });
        }
        //TODO: implement side list
        //const sideListNode = getBinaryNodeChild(usyncNode, 'side_list')
        return queryResult;
    }
    withDeviceProtocol() {
        this.protocols.push(new USyncDeviceProtocol());
        return this;
    }
    withContactProtocol() {
        this.protocols.push(new USyncContactProtocol());
        return this;
    }
    withStatusProtocol() {
        this.protocols.push(new USyncStatusProtocol());
        return this;
    }
    withDisappearingModeProtocol() {
        this.protocols.push(new USyncDisappearingModeProtocol());
        return this;
    }
    withBotProfileProtocol() {
        this.protocols.push(new USyncBotProfileProtocol());
        return this;
    }
    withLIDProtocol() {
        this.protocols.push(new USyncLIDProtocol());
        return this;
    }
}

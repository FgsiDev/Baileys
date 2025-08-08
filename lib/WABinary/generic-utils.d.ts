export function binaryNodeToString(node: any, i?: number): any;
export function getBinaryNodeChildren(node: any, childTag: any): any;
export function getAllBinaryNodeChildren({ content }: {
    content: any;
}): any[];
export function getBinaryNodeChild(node: any, childTag: any): any;
export function getBinaryNodeChildBuffer(node: any, childTag: any): any;
export function getBinaryNodeChildString(node: any, childTag: any): any;
export function getBinaryNodeChildUInt(node: any, childTag: any, length: any): number | undefined;
export function getBinaryFilteredButtons(nodeContent: any): any;
export function assertNodeErrorFree(node: any): void;
export function reduceBinaryNodeToDictionary(node: any, tag: any): any;
export function getBinaryNodeMessages({ content }: {
    content: any;
}): proto.WebMessageInfo[];
import { proto } from "../../WAProto";

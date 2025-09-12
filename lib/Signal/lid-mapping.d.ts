export class LIDMappingStore {
    constructor(keys: any, onWhatsAppFunc: any);
    keys: any;
    onWhatsAppFunc: any;
    /**
     * Store LID-PN mapping - USER LEVEL
     */
    storeLIDPNMapping(lid: any, pn: any): Promise<void>;
    /**
     * Store LID-PN mapping - USER LEVEL
     */
    storeLIDPNMappings(pairs: any): Promise<void>;
    /**
     * Get LID for PN - Returns device-specific LID based on user mapping
     */
    getLIDForPN(pn: any): Promise<string | null>;
    /**
     * Get PN for LID - USER LEVEL with device construction
     */
    getPNForLID(lid: any): Promise<string | null>;
}

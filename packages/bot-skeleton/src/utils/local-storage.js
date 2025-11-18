import LZString from 'lz-string';
import localForage from 'localforage';
import DBotStore from '../scratch/dbot-store';
import { save_types } from '../constants/save-type';
import AutoRobot from './bots/$hmspeedbot$.xml';
import OverUnderBot from './bots/ALEXSPEEDBOT_EXPRO.xml';
import Derivminer from './bots/D-Xpert_Speed_bot_entry_point.xml';
import Mrduke from './bots/Mr_duke_ov2_bot.xml';
import Recovery from './bots/OVER_1_WITH_OVER_3_RECOVERY.xml';
import Sv6 from './bots/Sv6.xml';
import Recovery8 from './bots/UNDER_8_WITH_UNDER_6_RECOVERY.xml';
import Trdtool from './bots/TRDTOOLENTRYPOINT.xml';
import Overunderturbo from './bots/Overunderturbo.xml';
import ovr24Strct from './bots/ovr24Strct.xml';


// Static bot configurations
const STATIC_BOTS = {
        Trdtool_1: {
        id:  Trdtool_1',
        name: 'Trd tool',
        xml: Trdtool,
        timestamp: Date.now(),
        save_type: save_types.LOCAL,
    },
    Overunderturbo_1: {
        id: 'Overunderturbo_1',
        name: 'Over under turbo',
        xml: Overunderturbo,
        timestamp: Date.now(),
        save_type: save_types.LOCAL,
    },
    ovr24Strct_1: {
        id: 'ovr24Strct_1',
        name: 'over 2 & 4 Strct',
        xml: ovr24Strct,
        timestamp: Date.now(),
        save_type: save_types.LOCAL,
    },
    auto_robot: {
        id: 'auto_robot',
        name: '$hmspeedbot$',
        xml: AutoRobot,
        timestamp: Date.now(),
        save_type: save_types.LOCAL,
    },
    over_under: {
        id: 'over_under_bot_by_GLE',
        name: 'ALEXSPEEDBOT EXPRO',
        xml: OverUnderBot,
        timestamp: Date.now(),
        save_type: save_types.LOCAL,
    },
    deriv_miner_pro: {
        id: 'deriv_miner_pro',
        name: 'D-Xpert Speed bot entry point',
        xml: Derivminer,
        timestamp: Date.now(),
        save_type: save_types.LOCAL,
    },
    mrduke: {
        id: 'auto_robot',
        name: 'Mr duke ov2 bot',
        xml: Mrduke,
        timestamp: Date.now(),
        save_type: save_types.LOCAL,
    },
    recovery: {
        id: 'over_under_bot_by_GLE',
        name: 'OVER 1 WITH OVER 3 RECOVERYM27 Auto Switch bot 2024',
        xml: Recovery,
        timestamp: Date.now(),
        save_type: save_types.LOCAL,
    },
    sv6: {
        id: 'deriv_miner_pro',
        name: 'SV6',
        xml: Sv6,
        timestamp: Date.now(),
        save_type: save_types.LOCAL,
    },
    deriv_miner_pro: {
        id: 'deriv_miner_pro',
        name: 'UNDER 8 WITH UNDER 6 RECOVERY',
        xml: Recovery8,
        timestamp: Date.now(),
        save_type: save_types.LOCAL,
    },
};

const getStaticBots = () => Object.values(STATIC_BOTS);

/**
 * 🔒 Disable saving bots
 */
export const saveWorkspaceToRecent = async () => {
    console.warn('[INFO] Saving disabled → Using static bots only.');
    const {
        load_modal: { updateListStrategies },
    } = DBotStore.instance;
    updateListStrategies(getStaticBots());
};

/**
 * ✅ Always return static bots
 */
export const getSavedWorkspaces = async () => {
    const bots = getStaticBots();
    console.log(
        '[DEBUG] Available static bots:',
        bots.map(bot => bot.id)
    );
    return bots;
};

/**
 * Load a bot by ID (from static list only)
 */
export const loadStrategy = async strategy_id => {
    console.log(`[DEBUG] Attempting to load bot: ${strategy_id}`);

    // Check for duplicate IDs
    const staticBots = getStaticBots();
    const duplicateIds = staticBots.filter((bot, index) => staticBots.findIndex(b => b.id === bot.id) !== index);

    if (duplicateIds.length > 0) {
        console.error(
            '[ERROR] Duplicate bot IDs found:',
            duplicateIds.map(b => b.id)
        );
    }

    const strategy = staticBots.find(bot => bot.id === strategy_id);

    if (!strategy) {
        console.error(
            `[ERROR] Bot with id "${strategy_id}" not found. Available bots:`,
            staticBots.map(b => b.id)
        );
        return false;
    }

    try {
        // Check if workspace is initialized
        if (!Blockly.derivWorkspace) {
            console.error('[ERROR] Blockly workspace not initialized');
            return false;
        }

        // Clear existing workspace first
        console.log('[DEBUG] Clearing existing workspace');
        Blockly.derivWorkspace.clear();

        const parser = new DOMParser();
        const xmlDom = parser.parseFromString(strategy.xml, 'text/xml').documentElement;

        // Check if XML is valid
        if (xmlDom.querySelector('parsererror')) {
            console.error('[ERROR] Invalid XML content for bot:', strategy_id);
            return false;
        }

        const convertedXml = convertStrategyToIsDbot(xmlDom);

        Blockly.Xml.domToWorkspace(convertedXml, Blockly.derivWorkspace);
        Blockly.derivWorkspace.current_strategy_id = strategy_id;

        console.log(`[SUCCESS] Loaded static bot: ${strategy.name} (ID: ${strategy_id})`);
        return true;
    } catch (error) {
        console.error('Error loading static bot:', error);
        return false;
    }
};

/**
 * 🔒 Disable removing bots
 */
export const removeExistingWorkspace = async () => {
    console.warn('[INFO] Remove disabled → Static bots only.');
    return false;
};

/**
 * Ensure xml has `is_dbot` flag
 */
export const convertStrategyToIsDbot = xml_dom => {
    if (!xml_dom) return;
    xml_dom.setAttribute('is_dbot', 'true');
    return xml_dom;
};

// 🧹 Clear storage & recents at startup
localStorage.removeItem('saved_workspaces');
localStorage.removeItem('recent_strategies');
console.log('[INFO] Cleared saved/recent bots → Static bots only.');

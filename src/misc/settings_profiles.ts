import { settings_selector } from '../main'
import { paraphraser } from '../messages/paraphraser'

export interface SettingsObject {
    backendTranslator?: string,
    backendEstimator?: string,
    backendParaphraser?: string,
    backendAligner?: string,
    language1?: string,
    language2?: string,
}

export interface SettingsProfile {
    settings?: SettingsObject,
    // quality estimation
    qe?: boolean,
    // machine translation (translate 1)
    mt?: boolean,
    // backward translation (translate 2)
    bt?: boolean,
    // paraphrasing
    pp?: boolean,
    // allow further manual settings, defaults to false
    manual?: boolean,
}

export class SettingsProfiles {
    public static profiles: {[id: string]: SettingsProfile} = {}

    public static setSettingsTag(profile: string) {
        this.setSettings(this.profiles[profile])
    }

    public static setSettings(profile: SettingsProfile) {
        if(profile.qe != undefined) {
            if(profile.qe) {
                // This is very much an edge case. If qe is to be shown but the settings
                // object contains no backend, then this could be confusing for the user.
            } else {
                if(profile.settings != undefined) {
                    profile.settings.backendEstimator = 'none'
                } else {
                    profile.settings = { backendEstimator: 'none' }
                }
            }
        }

        if(profile.settings != undefined) {
            settings_selector.forceSettings(profile.settings)
        }

        settings_selector.hide(profile.manual == undefined || !profile.manual)

        if(profile.mt != undefined) {
            if(profile.mt) {
                $('#input_target_block').show()
            } else {
                $('#input_target_block').hide()
            }
        }

        if(profile.bt != undefined) {
            if(profile.bt) {
                $('#input_back_block').show()
            } else {
                $('#input_back_block').hide()
            }
        }

        if(profile.pp != undefined) {
            if(profile.pp) {
                $('#input_para_block').show()
            } else {
                $('#input_para_block').hide()
            }
        }
    }
}

SettingsProfiles.profiles['default'] = {
    settings: {
        backendTranslator: 'avgENET',
        backendEstimator: 'sheffield',
        backendParaphraser: 'rainbow',
        backendAligner: 'fastAlign',
        language1: 'en',
        language2: 'et',
    },
    qe: true,
    mt: true,
    bt: true,
    pp: true,
    manual: true,
}

SettingsProfiles.profiles['pilot'] = {
    settings: {
        backendTranslator: 'ufalTransformer',
        backendEstimator: 'openkiwi',
        backendAligner: 'fastAlign',
        language1: 'cs',
        language2: 'de',
    },
    qe: true,
    mt: true,
    bt: true,
    pp: false,
    manual: false,
}

SettingsProfiles.profiles['edin'] = {
    settings: {
        backendTranslator: 'ufalTransformer',
        backendEstimator: 'openkiwi',
        backendParaphraser: 'rainbow',
        backendAligner: 'fastAlign',
        language1: 'en',
        language2: 'cs',
    },
    qe: false,
    mt: true,
    bt: true,
    pp: true,
    manual: false,
}

SettingsProfiles.profiles['sao'] = {
    settings: {
        backendTranslator: 'neurotolge',
        backendEstimator: 'none',
        backendParaphraser: 'rainbow',
        backendAligner: 'none',
        language1: 'en',
        language2: 'et',
    },
    qe: false,
    mt: true,
    bt: true,
    pp: true,
    manual: true,
}

SettingsProfiles.profiles['csen'] = {
    settings: {
        backendTranslator: 'ufalTransformer',
        backendEstimator: 'openkiwi',
        backendAligner: 'fastAlign',
        language1: 'cs',
        language2: 'en',
    },
    qe: true,
    mt: true,
    bt: true,
    pp: true,
    manual: true,
}
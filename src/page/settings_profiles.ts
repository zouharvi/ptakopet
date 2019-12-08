import { settings_selector } from '../main'

export interface SettingsObject {
    backendTranslator?: string,
    backendEstimator?: string,
    backendAligner?: string,
    language1?: string,
    language2?: string,
}

export interface SettingsProfile {
    settings: SettingsObject,
    // quality estimation
    qe: boolean,
    // machine translation (translate 1)
    mt: boolean,
    // backward translation (translate 2)
    bt: boolean,
    // paraphrasing
    pp: boolean,
    // allow further manual settings
    manual: boolean,
}

export class SettingsProfiles {
    public static profiles: {[id: string]: SettingsProfile} = {}

    public static setSettingsTag(profile: string) {
        this.setSettings(this.profiles[profile])
    }

    public static setSettings(profile: SettingsProfile) {
        if(profile.qe) {
            // This is very much an edge case. If qe is to be shown but the settings
            // object contains no backend, then this could be confusing for the user.
        } else {
            profile.settings.backendEstimator = 'none'
        }
        settings_selector.forceSettings(profile.settings)

        settings_selector.hide(!profile.manual)

        if(profile.mt) {
            $('#input_target_block').show()
        } else {
            $('#input_target_block').hide()
        }

        if(profile.bt) {
            $('#input_back_block').show()
        } else {
            $('#input_back_block').hide()
        }

        if(profile.pp) {
            $('#input_para_block').show()
        } else {
            $('#input_para_block').hide()
        }
    }
}

SettingsProfiles.profiles['pilot'] = {
    settings: {
        backendTranslator: 'ufalTranslationDev',
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
        backendTranslator: 'ufalTranslationDev',
        backendEstimator: 'openkiwi',
        backendAligner: 'fastAlign',
        language1: 'cs',
        language2: 'de',
    },
    qe: false,
    mt: true,
    bt: true,
    pp: true,
    manual: true,
}
import _baked_study_raw from './data/study_pilot.json'
import { SettingsProfile } from '../misc/settings_profiles.js'

interface BakedStudyType {
    users: {
        [id: string]: { bakedQueue: Array<string>}
    },
    stimuli: { [id: string]: string },
    stimuliRules: {
        [id: string]: {
            message?: string,
            profile?: SettingsProfile,
        }
    },
}

let baked_study = _baked_study_raw as BakedStudyType
export { baked_study }
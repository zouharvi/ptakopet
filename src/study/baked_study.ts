import _baked_study_raw from './data/study_edin.json'
import { SettingsProfile } from '../misc/settings_profiles.js'

interface BakedStudyType {
    users: {
        [id: string]: Array<Array<string>>
    },
    stimuli: { [id: string]: string },
    stimuliRules: Array<{
        rule: string,
        message?: string,
        profile?: SettingsProfile,
    }>,
}

let baked_study = _baked_study_raw as BakedStudyType
export { baked_study }
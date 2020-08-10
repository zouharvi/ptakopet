import { SettingsProfile } from '../misc/settings_profiles.js'

export type BakedStudyType = {
    users: {
        [id: string]: Array<Array<string>>
    },
    stimuli: {
        [id: string]: string
    },
    stimuliRules: Array<{
        rule: string,
        message?: string,
        profile?: SettingsProfile,
    }>,
}

export async function load_baked_study(name: string, userID: string): Promise<BakedStudyType> {
    return new Promise<BakedStudyType>((resolve, reject) => {
        $.ajax({
            method: 'POST',
            url: 'https://quest.ms.mff.cuni.cz/zouharvi/login',
            data: {uid: userID},
            success: (data) => {
                resolve(data as BakedStudyType)
            },
        }).fail(reject)
    })
}
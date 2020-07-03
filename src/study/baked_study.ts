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

export async function load_baked_study(name: string): Promise<BakedStudyType> {
    return new Promise<BakedStudyType>((resolve, reject) => {
        $.ajax({
            url: `baked_queues/study_${name}.json`,
            dataType: 'json',
            success: (data) => {
                resolve(data as BakedStudyType)
            },
        }).fail(reject)
    })
}
const api = require('./api.js');
const utils = require('./utils.js');
const leaderboard = require('./leaderboard.js');
const Table = require("easy-table");

const updateServerInfo = async (client) => {
    const messages = await utils.allMessagesFromChannelList(client);
    const filteredMessages = messages.filter(msg => {
        const embed = msg.embeds[0];
        if (embed && embed.author && !embed.author.name.startsWith('Leaderboard')) {
            return true;
        }
        return false;
    });


    if (filteredMessages.length > 0) {
        await Promise.all(filteredMessages.map(async msg => {

            const embed = msg.embeds[0];
            const address = embed.fields.find(field => field.name === 'Адрес сервера:').value.split('`')[1];

            try {
                const serverData = await api.fetchInfo(address);

                const t = new Table;
                if (serverData.players != null) {
                    serverData.players.forEach(function(player) {
                        if (player.DriverName != null) {
                            t.cell('Имя', player.DriverName);
                            t.cell('Машина', getCar(player.Model));
                            t.newRow();
                        }
                    })
                }

                const newMessage = Object.assign(embed);
                const timestampEdit = new Date();
                newMessage.fields.find(field => field.name === 'Игроков на сервере:').value = `:busts_in_silhouette: ${serverData.currentPlayers || 0}/${serverData.maxPlayers || 0}`;
                newMessage.fields.find(field => field.name === 'Статус:').value = serverData.status;
                if (newMessage.fields.find(field => field.name === 'Игроки на сервере:') !== undefined) {
                    newMessage.fields.find(field => field.name === 'Игроки на сервере:').value = `\`\`\`${t.toString()}\`\`\``;
                }
                newMessage.data.timestamp = timestampEdit;
                await msg.edit({embeds: [newMessage]});
            } catch (error) {
                console.error('Something went wrong while trying to edit the server info message: ', error);
            }
        }));
        let now = new Date();
        console.log(now.toISOString() + ' Finished updating server info for all servers.');
    }
};

const updateLeaderboards = async (client) => {
    const messages = await utils.allMessagesFromChannelList(client)
    const filteredMessages = messages.filter(msg => {
        const embed = msg.embeds[0];


        if (embed && embed.author.name.startsWith('Leaderboard')) {
            return true;
        }
        return false;
    });

    if (filteredMessages.length > 0) {
        await Promise.all(filteredMessages.map(async msg => {
            if (msg.embeds && msg.embeds[0].author) {
                const embed = msg.embeds[0]
                const strackerUrl = embed.url
                const description = embed.description
                const name = embed.author.name
                const timestampEdit = new Date();
                try {
                    const newMessage = await leaderboard(strackerUrl, description, name)
                    newMessage.data.timestamp = timestampEdit;
                    await msg.edit({embeds: [newMessage]})
                } catch (error) {
                    console.error('An error occurred while trying to update the leaderboard message', error)
                }
            }
        }))
        console.log('Finished updating all leaderboards')
    }
}


module.exports = {
    updateServerInfo,
    updateLeaderboards
};

const getCar = (car) => {
    let car_list = new Map([
        ["as_bmw_m3_g80_Stage_3", "BMW M3 G80"],
        ["prvvy_bmw_m3_f80_comp_single_turbo", "BMW M3 F80"],
        ["tgn_x_prvvy_bmw_m340i_g20", "BMW M340i G20"],
        ["bmw_m4_comp_prvvy_tgn", "BMW M4 2018"],
        ["as_bmw_m4_competition_g82_Stage_3", "BMW M4 G82"],
        ["mnba_bmw_m5_f90_competition", "BMW M5 F90"],
        ["lew1x_bmw_x5m_f85_tuned", "BMW X5M"],
        ["ms_bmw_x6m_2015_tune", "BMW X6M"],
        ["jk_camaro_2019ssamt", "Chevy Camaro"],
        ["nb_lamborghini_aventadorsvjn", "Lambo Aventador"],
        ["tidy_lamborghini_huracan", "Lambo Huracan"],
        ["mlgz_x_prvvy_urus_mansory", "Lambo Urus"],
        ["jw_lexus_lfa", "Lexus LFA"],
        ["tgn_lexus_rcft", "Lexus RC F"],
        ["mazda_rx8_r3_s1_mana", "Mazda RX8"],
        ["bg_mercedes_amg_gt_black_series", "Mercedes GT AMG"],
        ["mercedesc63amgdukalius", "Mercedes C63 AMG"],
        ["faz_cls63_wengalbi", "Mercedes CLS63S AMG"],
        ["sa_e63s_pushin_p_tune", "Mercedes E63 AMG"],
        ["faz_mercedes_g63", "Mercedes G63 AMG"],
        ["prvvy_x_mlgz_evo_varis", "Mitsubishi Lancer EVO X"],
        ["bkXHM_nissan_gtr_21_RB_KIT", "Nissan GT-R35"],
        ["as_nissan_skyline_bnr32_pandem", "Nissan Skyline R32"],
        ["as_porsche_cayman_718_gt4_rs", "Porsche Cayman 718 GT4"],
        ["porsche_911_gt3_2022_Manthey_Racing", "Porsche 911 GT3"],
        ["ks_porsche_panamera_phaff", "Porsche Panamera Turbo"],
        ["strider_varis_wrx", "Subaru WRX STi 2009"],
        ["yg_toyota_chaser_jzx100_vertexaero_v2", "Toyota Chaser JZX100"],
        ["yg_toyota_cresta_jzx100_street", "Toyota Cresta JZX100"],
        ["paris_toyota_supra_a80_1997_shuto", "Toyota Supra JZA80"],
        ["wdts2023_nissan_180sx", "Nissan 180sx"],
        ["wdts2023_nissan_laurel_c33", "Nissan Laurel C33"],
        ["wdts2023_nissan_silvia_s13", "Nissan Silvia S13"],
        ["wdts2023_nissan_silvia_s14", "Nissan Silvia S14"],
        ["wdts2023_nissan_silvia_s15", "Nissan Silvia S15"],
        ["wdts2023_nissan_skyline_hr34", "Nissan Skyline R34"],
        ["wdts2023_nissan_skyline_r32", "Nissan Skyline R32"],
        ["wdts2023_toyota_ae86", "Toyota AE86"],
        ["wdts2023_toyota_cresta_jzx100", "Toyota Cresta JZX100"],
        ["wdts2023_toyota_mark_ii_jzx90", "Toyota Mark II JZX90"],
        ["bdb_chevrolet_corvette_c6", "Chevy Corvette C6"],
        ["bdb_mazda_miata_na1", "Mazda MX-5"],
        ["bdb_mazda_rx7_fc3s", "Mazda RX7"],
        ["bdb_nissan_180sx", "Nissan 180SX"],
        ["bdb_nissan_laurel_c33", "Nissan Laurel C33"],
        ["bdb_nissan_silvia_ps13", "Nissan Silvia S13"],
        ["bdb_nissan_silvia_s13", "Nissan Silvia S13"],
        ["bdb_nissan_silvia_s14", "Nissan Silvia S14"],
        ["bdb_nissan_silvia_s15", "Nissan Silvia S15"],
        ["bdb_nissan_skyline_er34", "Nissan Skyline R34"],
        ["bdb_nissan_skyline_r31_wagon", "Nissan Skyline R31 Wagon"],
        ["bdb_toyota_ae86_coupe", "Toyota AE86"],
        ["bdb_toyota_altezza_sxe10", "Toyota Altezza SXE10"],
        ["bdb_toyota_mark_ii_jzx81", "Toyota Mark II JZX81"],
        ["bdb_volvo_850r", "Volvo 850R"],
        ["dbz_evo3_yaris", "Toyota Yaris"],
        ["dbz_evo3_jzx100_mark2_vertex", "Toyota Mark II JZX100"],
        ["dbz_evo3_corolla", "Toyota Corolla"],
        ["dbz_evo3_nissan_370_z34", "Nissan 370Z"],
        ["dbz_evo3__nissan_silvia_s15_uras", "Nissan Silvia S15"],
        ["dbz_evo3_s14", "Nissan Silvia S14"],
        ["dbz_evo3_mustang_rtr", "Ford Mustang"],
        ["dbz_evo3_rx8", "Mazda RX8"],
        ["dbz_evo3_e92_hgk", "BMW E92"],
        ["vdc_toyota_jzx100_markii_public", "Toyota Mark II JZX100"],
        ["vdc_nissan_r33_public", "Nissan Skyline R33"],
        ["vdc_shelby_supersnake_public", "Ford Mustang Shelby"],
        ["vdc_mazda_rx7_20b_public", "Mazda RX7"],
        ["vdc_mazda_rx8_public", "Mazda RX8"],
        ["vdc_nissan_gtr_35_public", "Nissan GT-R35"],
        ["vdc_nissan_s15_public", "Nissan Silvia S15 SR20"],
        ["vdc_nissan_s15_public_2jz", "Nissan Silvia S15 2JZ"],
        ["vdc_nissan_s14_zenki_public", "Nissan Silvia S14"],
        ["vdc_bmw_e92_public", "BMW E92"],
        ["vdc_bmw_e46_public", "BMW E46"]
    ]);

    return `${car_list.get(car)}`;
}
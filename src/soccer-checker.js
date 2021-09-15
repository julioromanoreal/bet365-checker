const axios = require("axios");
const schedule = require("node-schedule");
const Nightmare = require("nightmare");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

check = championshipName => {
    const nightmare = Nightmare({
        openDevTools: {
            mode: "detach"
        },
        show: false
    });

    nightmare
        .goto(process.env.BET365_URL)
        .wait(".wn-Classification")
        .evaluate(selector => {
            var opts = document.querySelectorAll(selector);
            for (var i = 0; i < opts.length; i++) {
                if (opts[i].innerText.trim() == "Futebol") {
                    opts[i].id = "futebol";
                }
            }
        }, ".wn-Classification")
        .click("#futebol")
        .wait(".sm-CouponLink")
        .evaluate(
            (selector, championshipName) => {
                var championships = document.querySelectorAll(selector);
                for (var i = 0; i < championships.length; i++) {
                    if (
                        championships[i].innerText.indexOf(championshipName) >=
                        0
                    ) {
                        championships[i].id = "championshipfound";
                    }
                }
            },
            ".sm-CouponLink",
            championshipName
        )
        .click("#championshipfound")
        .wait(".gll-ParticipantOddsOnly_Odds")
        .evaluate(selector => {
            var infoResult = {
                matches: [],
                championship: document.querySelector(".cl-EnhancedDropDown")
                    .innerText
            };
            var matches = document.querySelectorAll(
                ".sl-CouponParticipantWithBookCloses_Name"
            );
            var odds = document.querySelectorAll(
                ".gll-ParticipantOddsOnly_Odds"
            );
            var nrMatches = matches.length;

            for (var i = 0; i < matches.length; i++) {
                var match = matches[i];
                var odd1 = odds[i];
                var odd2 = odds[i + nrMatches];
                var odd3 = odds[i + nrMatches + nrMatches];
                var desc = `${match.innerText}\n1: ${odd1.innerText}\nX: ${odd2.innerText}\n2: ${odd3.innerText}`;

                infoResult.matches.push({
                    match: match.innerText,
                    desc: desc
                });
            }

            return infoResult;
        }, ".gll-ParticipantOddsOnly_Odds")
        .end()
        .then(r => {
            if (r.matches.length) {
                const filePath = "./.data/." + convertToSlug(r.championship);
                fs.appendFileSync(filePath, "");
                const f = fs.readFileSync(filePath);

                const newMatchesToFile = r.matches
                    .filter(r => f.indexOf(r.match) < 0)
                    .map(r => r.match);
                const newMatchesToMsg = r.matches
                    .filter(r => f.indexOf(r.match) < 0)
                    .map(r => r.desc)
                    .join("\n\n");
                if (newMatchesToMsg) {
                    sendTelegramMessage(
                        `<b>${r.championship}:</b> \n\n` + newMatchesToMsg
                    );
                    fs.appendFileSync(filePath, newMatchesToFile);
                    console.log(newMatchesToMsg);
                } else {
                    console.log(`No new matches for ${r.championship}`);
                }
            } else {
                console.log(`No matches for ${r.championship}`);
            }
        })
        .catch(error => {
            console.log(`No matches for ${championshipName}`);
        });
};

sendTelegramMessage = text => {
    axios
        .get(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=@Bet365Soccer&parse_mode=html&text=${encodeURIComponent(
                text
            )}`
        )
        .catch(r => {
            console.log(r);
        });
};

checkAll = () => {
    const championshipsArr = fs.readFileSync("./config/championships", "utf-8");
    const championships = championshipsArr.split("\n");
    for (let i = 0; i < championships.length; i++) {
        console.log(`Checking ${championships[i]}`);
        check(championships[i]);
    }
};

convertToSlug = text => {
    const a = "àáäâãèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;";
    const b = "aaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------";
    const p = new RegExp(a.split("").join("|"), "g");
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(p, c => b.charAt(a.indexOf(c))) // Replace special chars
        .replace(/&/g, "-and-") // Replace & with 'and'
        .replace(/[\s\W-]+/g, "-"); // Replace spaces, non-word characters and dashes with a single dash (-)
};

checkAll();

schedule.scheduleJob("* * * * *", function() {
    checkAll();
    setTimeout(checkAll, 30000);
});

/** @param {NS} ns **/
import {
    formatMoney, formatRam, formatDuration, formatDateTime, formatNumber,
    scanAllServers, hashCode, disableLogs, log as logHelper, getFilePath,
    getNsDataThroughFile_Custom, runCommand_Custom, waitForProcessToComplete_Custom,
    tryGetBitNodeMultipliers_Custom, getActiveSourceFiles_Custom,
    getFnRunViaNsExec, getFnIsAliveViaNsPs
} from './helpers.js'

export async function main(ns) {

    //let corp1 = corp.getCorporation();
    disableLogs(ns, [`exec`, `sleep`])
    const corp = eval("ns.corporation"); ///shhhh
    const logBase = (n, base) => Math.log(n) / Math.log(base);

    let upgradeSpeed = 1;
    let profit = 0;
    let phase = 1;
    let maintLoopCounter = 0;
    let incomeThreshold = 0;
    let upgradeScale = 1;

    let divisionDB = [
        { name: "Agriculture", startPoint: 1.5e10 },//15B
        { name: "Food", startPoint: 1e10 }, //10B
        { name: "Tobacco", startPoint: 2e10 }, //20B
        { name: "Software", startPoint: 2.5e10 }, //25B
        { name: "Chemical", startPoint: 7e10 }, //70B
        { name: "Fishing", startPoint: 8e10 }, //80B
        { name: "Utilities", startPoint: 1.5e11 }, // 150B
        { name: "Pharmaceutical", startPoint: 2e11 }, //200B
        { name: "Energy", startPoint: 2.25e11 }, //225B
        { name: "Mining", startPoint: 3e11 },//300B
        { name: "Computer", startPoint: 5e11 },//500B
        { name: "RealEstate", startPoint: 6e11 },//600B
        { name: "Healthcare", startPoint: 7.5e11 },//750B
        { name: "Robotics", startPoint: 1e12 },//1T
    ]

    let corpUpgrades = ["Smart Factories", "Smart Storage", "FocusWires", "Neural Accelerators", "Speech Processor Implants", "Nuoptimal Nootropic Injector Implants", "Wilson Analytics",
        "DreamSense", "ABC SalesBots", "Project Insight"];

    let corpUnlockables = ["Smart Supply", "Export", "VeChain", "Market Research - Demand", "Market Data - Competition", "Shady Accounting", "Government Partnership"]
    let nextrun = "";

    function updateData() {
        for (let d of divisionDB) {
            corp1 = corp.getCorporation();
            d.running = ns.isRunning("/corp/boardroom.js", "home", "--div", d.name);
            d.shouldRun = corp1.funds * upgradeSpeed > d.startPoint;
            profit = (corp1.revenue - corp1.expenses);
            //ns.print(d)
        }
    }

    async function processCorpUpgrade(upgrade) {


        if (corp.getUpgradeLevel(upgrade) < 2 && corp.getUpgradeLevelCost(upgrade) < corp1.funds) {
            ns.print(`SUCCESS: ${upgrade} level increased by 1.`)
            corp.levelUpgrade(upgrade);
        } //else ns.print(`FAILED: ${upgrade} CASE first ifelse.`)

        if ((corp.getUpgradeLevelCost(upgrade) > corp1.funds * upgradeSpeed)) {
            ns.print(`FAILED: Insufficient funds to Upgrade ${upgrade}`);
            return;
        }

        if (corp.getUpgradeLevelCost(upgrade) < corp1.funds * upgradeSpeed) {
            ns.print(`SUCCESS: ${upgrade} level increased by 1.`)
            corp.levelUpgrade(upgrade);
        } //else ns.print(`FAILED: ${upgrade} CASE CALLED 2.`)

        //else ns.print(`SUCCESS: ${upgrade} CASE CALLED.`)
        //ns.print(`SUCCESS: ${upgrade} CASE CALLED 3.`)
        //ns.print(`SUCCESS: ${upgrade} CASE returned.`)

    }

    async function corpUpgrader(ns, force) {
        updateData(); //refresh corp1 stats
        ns.print(`CORP-UPGRADER: Checking for levelable upgrade...`);
        for (let upgrade of corpUpgrades) {

            switch (upgrade) {
                case `Focus Wires`:
                    ns.print(`CORP-UPGRADER: ${upgrade}...`);
                    processCorpUpgrade(upgrade);
                    break;

                case `Neural Accelerators`:
                    ns.print(`CORP-UPGRADER: ${upgrade}...`);
                    processCorpUpgrade(upgrade);
                    break;

                case "Speech Processor Implants":
                    ns.print(`CORP-UPGRADER: ${upgrade}...`);
                    processCorpUpgrade(upgrade);
                    break;

                case "Nuoptimal Nootropic Injector Implants":
                    ns.print(`CORP-UPGRADER: ${upgrade}...`);
                    processCorpUpgrade(upgrade);
                    break;

                case "Smart Factories":
                    ns.print(`CORP-UPGRADER: ${upgrade}...`);
                    processCorpUpgrade(upgrade);

                    break;

                default:
                    if (force && corp.getUpgradeLevelCost(upgrade) < corp1.funds * upgradeSpeed) {
                        corp.levelUpgrade(upgrade);
                        ns.print(`SUCCESS: DEFAULT ${upgrade} level increased by 1.`)
                    } else ns.print(`FAILED: Insufficient funds to Upgrade ${upgrade}`);

            }

            updateData(); //refresh corp1 stats
        };
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    purchaseUpgrade()
    purchase corp1 unlockable upgrades based on a predfined order list.
    */

    function purchaseUnlock(ns) {
        ns.print(`Checking for funds to purchase unlocks...`);
        updateData(); //refresh corp1 stats
        let costPercent = 0.1
        for (let corpUnlock of corpUnlockables) {
            let cost = corp.getUnlockUpgradeCost(corpUnlock);

            if (corp.hasUnlockUpgrade(corpUnlock)) {
                ns.print(`INFO: ${corpUnlock} already owned`);
                return;
            }

            switch (corpUnlock) {

                case "Smart Supply":
                    if (cost <= corp1.funds * costPercent) {
                        corp.unlockUpgrade(corpUnlock);
                        ns.print(`SUCCESS: Purchased ${corpUnlock} for ${formatMoney(cost)}`);
                        return;
                    } else if (cost > corp1.funds * costPercent) {
                        ns.print(`FAILED: Insufficient funds to buy ${corpUnlock}. ${formatMoney(cost)} > ${formatMoney(corp1.funds * costPercent)} `);
                    }
                    break;

                default:
                    if (phase > 20) {
                        if (cost <= corp1.funds * costPercent) {
                            corp.unlockUpgrade(corpUnlock);
                            ns.print(`SUCCESS: Purchased ${corpUnlock} for ${formatMoney(cost)}`);
                            return;
                        } else if (cost > corp1.funds * costPercent) {
                            ns.print(`FAILED: Insufficient funds to buy ${corpUnlock}. ${formatMoney(cost)} > ${formatMoney(corp1.funds * costPercent)} `);
                        }

                    }
                    break;

            }


        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    getNoffer()
    checks for funding offers and accepts if they are good enough
    */
    function getNoffer() {

        let offer = corp.getInvestmentOffer();
        var target_funds = 0;
        switch (offer.round) {
            case 1:
                target_funds = 2e11; // 200B
                break;
            case 2:
                target_funds = 5e12; // 5T
                break;
            case 3:
                target_funds = 3e13; // 50T
                break;
            case 4:
                target_funds = 3e14; // 500T
                break;

            default:
                break;
        }

        if (offer.funds > target_funds) {
            corp.acceptInvestmentOffer();
            return true;
        }
    }

    async function startBoardroom(name) {
        nextrun = divisionDB.find(d => d.shouldRun && !d.running)

        name = "" ? name = nextrun.name : name;
        ns.print(name)
        if (nextrun.name == undefined || nextrun.name == "") {
            ns.print(`Boardroom undefined`)

            return;
        } else {
            ns.print(`Firing off script for ${nextrun.name}`)
            let pid = ns.exec("/corp/boardroom.js", "home", 1, "--div", name);
            ns.tail(pid);
            nextrun = divisionDB.find(d => d.shouldRun && !d.running)
            ns.print(`next up should be ${nextrun.name}`)
        }
    }
    /* ================================------------------- MAIN ---------------------====================================
        
                                                            PHASE ONE
        
           Create a corp. determine if you can self fund, or if youre in BN3.
       */

    let rootname = "FUBAR"
    let player = ns.getPlayer(); // refresh player data
    const selfFund = player.money >= 1.5e11
    let worked = false;
    if (!player.hasCorporation) {
        if (selfFund) {
            worked = corp.createCorporation(rootname, selfFund);
        } else if (!selfFund && player.bitNodeN == 3) {
            worked = corp.createCorporation(rootname, selfFund);
        } else {
            ns.print("FAILED: Too poor to start a company and you're not in BN3 (required for seed money option)");
        }
        if (!worked) {
            ns.print("FAILED: Cant create ", rootname);
        }
    } else ns.print(`SUCCESS: Player has a corp already.`)

    let corp1 = corp.getCorporation();

    updateData();

    startBoardroom("Agriculture");

    if (!corp.hasUnlockUpgrade(corpUnlockables[0]) && corp.getUnlockUpgradeCost(corpUnlockables[0]) <= corp1.funds) {
        corp.unlockUpgrade(corpUnlockables[0])
        ns.print(`SUCCESS: Purchased SmartSupply`)
    }

    corpUpgrader(ns, false);

    while (true) {

        maintLoopCounter += 1;
        ns.print(`BEGIN MAINTENANCE LOOP ---------- LOOP ${maintLoopCounter}----------`)

        updateData();
        //maintLoopCounter = 0;
        upgradeScale = logBase(maintLoopCounter + 9, 9);
        incomeThreshold = Math.pow(5e5, upgradeScale);

        ns.print(`INFO: profit  of ${formatMoney(incomeThreshold)}, currently ${formatMoney(profit)} `);
        ns.print(`${upgradeScale} - ${formatMoney(incomeThreshold)}`)

        while (profit <= incomeThreshold) {
            ns.print(`INFO: Waiting on profit threshold of ${formatMoney(incomeThreshold)}, currently ${formatMoney(profit)} `);

            //for (let d of divisionDB) {


            // }

            getNoffer()
            // corpUpgrader(ns, false);
            purchaseUnlock(ns)
            startBoardroom("");
            let dividendPercent = (profit / corp1.revenue) * 100
            if (!corp1.public) {
                let publicThreshold = 5e20
                let shouldGoPublic = corp1.funds > publicThreshold
                if (shouldGoPublic) {
                    let shareOffer = 1e6;
                    corp.goPublic(shareOffer);
                    corp.issueDividends(dividendPercent);

                }

            }
            await ns.sleep(1000)
        }

        updateData();
        await ns.sleep(600)
        // await ns.sleep(10000);
    }
}
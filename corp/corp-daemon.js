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

    const corp = eval("ns.corporation"); ///shhhh

    let divisionDB = [
        { name: "Agriculture", startPoint: 1.5e10 },
        { name: "Mining", startPoint: 1.5e11 },
        { name: "Tobacco", startPoint: 5e11 },
        { name: "Energy", startPoint: 1e12 },
        { name: "Food", startPoint: 4e12 },
        { name: "Utilities", startPoint: 1.5e13 },
        { name: "Computer", startPoint: 5e13 },
        { name: "Fishing", startPoint: 1.5e14 },
        { name: "Software", startPoint: 5e14 },
        { name: "Chemical", startPoint: 1e15 },
        { name: "Pharmaceutical", startPoint: 5e15 },
        { name: "Robotics", startPoint: 1.5e17 },
        { name: "Healthcare", startPoint: 1.5e18 },
        { name: "RealEstate", startPoint: 1.5e19 }
    ]

    let corpUpgrades = ["Smart Factories", "Smart Storage", "FocusWires", "Neural Accelerators", "Speech Processor Implants", "Nuoptimal Nootropic Injector Implants", "Wilson Analytics",
        "DreamSense", "ABC SalesBots", "Project Insight"];

    let corpUnlockables = ["Smart Supply", "Export", "VeChain", "Market Research - Demand", "Market Data - Competition", "Shady Accounting", "Government Partnership"]


    function updateData() {
        for (let d of divisionDB) {
            corp1 = corp.getCorporation();
            d.running = ns.isRunning("/corp/boardroom.js", "home", "--div", d.name);
            d.shouldRun = d.startPoint < corp1.funds;

            //ns.print(d)
        }
    }

    async function corpUpgrader(ns, force) {
        updateData(); //refresh corp1 stats
        ns.print(`CORP-UPGRADER: Checking for levelable upgrade...`);
        for (let upgrade of corpUpgrades) {

            if (force && corp.getUpgradeLevelCost(upgrade) < corp1.funds * upgradeSpeed) {
                await corp.levelUpgrade(upgrade);
                ns.print(`SUCCESS: ${upgrade} level increased by 1.`)

            } //else ns.print(`FAILED: Insufficient funds to Upgrade ${upgrade}`);

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
        let costPercent = 0.4
        for (let corpUnlock of corpUnlockables) {
            let cost = corp.getUnlockUpgradeCost(corpUnlock);
            if (!corp.hasUnlockUpgrade(corpUnlock) && cost <= corp1.funds * costPercent) {
                corp.unlockUpgrade(corpUnlock);
                ns.print(`SUCCESS: Purchased ${corpUnlock} for ${formatMoney(cost)}`);
                return;
            } else if (cost > corp1.funds * costPercent) {
                ns.print(`FAILED: Insufficient funds to buy ${corpUnlock}. ${formatMoney(cost)} > ${formatMoney(corp1.funds)} `);
            } else ns.print(`INFO: ${corpUnlock} already owned`);
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

    /* ================================------------------- MAIN ---------------------====================================
        
                                                            PHASE ONE
        
           Create a corp. determine if you can self fund, or if youre in BN3.
       */

    let rootname = "FUBAR"
    let player = ns.getPlayer(); // refresh player data
    const selfFund = player.money >= 1.5e11
    let worked = false;
    if (!player.hascorp) {
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




    while (true) {

        for (let d of divisionDB) {

            if (!d.running && d.shouldRun) {
                ns.print(`Firing off script for ${d.name}`)
                let pid = ns.exec("/corp/boardroom.js", "home", 1, "--div", d.name);
                ns.tail(pid);
            }
        }

        getNoffer()
        corpUpgrader(ns, false);
        purchaseUnlock(ns)
        let dividendPercent = (corp1.revenue - corp1.expenses)
        if (!corp1.public) {
            let publicThreshold = 5e20
            let shouldGoPublic = corp1.funds > publicThreshold
            if (shouldGoPublic) {
                let shareOffer = 1e6;
                corp.goPublic(shareOffer);
                corp.issueDividends(dividendPercent);

            }

        }

        await ns.sleep(10000);
    }
}
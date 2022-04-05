/**  
 * 
 @param {NS} ns */
/* TODO

1. create objects for each division that include their phase settings, products that need to be sold (with settings),
and materials to put in the warehouse. this would replace switched 3d arrays.

*/
import {
    formatMoney, formatRam, formatDuration, formatDateTime, formatNumber,
    scanAllServers, hashCode, disableLogs, log as logHelper, getFilePath,
    getNsDataThroughFile_Custom, runCommand_Custom, waitForProcessToComplete_Custom,
    tryGetBitNodeMultipliers_Custom, getActiveSourceFiles_Custom,
    getFnRunViaNsExec, getFnIsAliveViaNsPs
} from './helpers.js'


const argsSchema = [
    ['div', ""],
    ['city', ""],
    ['mat', ""],
    ['phase', 1],
    ['loop', 1]
];

export function autocomplete(data, args) {
    data.flags(argsSchema);
    return [];
}
export async function main(ns) {


    let args = ns.flags(argsSchema);
    let phase = args[`phase`]; // args[0];
    let div = args[`div`];
    let cityName = args[`city`]
    let material = args[`mat`]
    let maintLoopCounter = args[`loop`]
    //const cities = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"];

    const corp = eval("ns.corporation"); ///shhhh
    let corp1 = corp.getCorporation(); // corp1 stats
    let division = corp.getDivision(div);


    function dynamicSort(property) {
        /*
        Credit to Ege Özcan in a post on stackoverflow
        */
        var sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a, b) {
            /* next line works with strings and numbers, 
             * and you may want to customize it to your needs
             */
            var result = (a[property] < b[property]) ? 1 : (a[property] > b[property]) ? -1 : 0;
            return result * sortOrder;
        }
    }

    let industryDB = [
        {
            name: "Energy",
            makesProducts: false, prodMats: ["Energy"],
            materialRatio: [["Hardware", 0], ["AI Cores", .20], ["RealEstate", .80], ["Robots", 0]], // based on charts
            reFac: 0.65, sciFac: 0.7, hwFac: 0, robFac: 0.05, aiFac: 0.3, advFac: 0.08,
            reqMats: { "Hardware": 0.1, "Metal": 0.2 }, incFac: 9, upFac: 5
        },

        {
            name: "Utilities",
            makesProducts: false, prodMats: ["Water"],
            materialRatio: [["Hardware", 0], ["AI Cores", .25], ["RealEstate", .25], ["Robots", .25]], // Based on charts
            reFac: 0.5, sciFac: 0.6, hwFac: 0, robFac: 0.4, aiFac: 0.4, advFac: 0.08,
            reqMats: { "Hardware": 0.1, "Metal": 0.1 }, incFac: 9, upFac: 5
        },

        {
            name: "Agriculture",
            makesProducts: false, prodMats: ["Plants", "Food"],
            materialRatio: [["Hardware", .1], ["AI Cores", .1], ["RealEstate", .7], ["Robots", .1]], // FROM PROD CHART
            reFac: 0.72, sciFac: 0.5, hwFac: 0.2, robFac: 0.3, aiFac: 0.3, advFac: 0.04,
            reqMats: { "Water": 0.5, "Energy": 0.5 }, incFac: 9, upFac: 5
        },

        {
            name: "Fishing",
            makesProducts: false, prodMats: ["Food"],
            materialRatio: [["Hardware", .3], ["AI Cores", .2], ["RealEstate", 0], ["Robots", .5]], // FROM PROD CHART
            reFac: 0.15, sciFac: 0.35, hwFac: 0.35, robFac: 0.5, aiFac: 0.2, advFac: 0.08,
            reqMats: { "Energy": 0.5 }, incFac: 9, upFac: 5
        },
        {
            name: "Mining",
            makesProducts: false, prodMats: ["Metal"],
            materialRatio: [["Hardware", .25], ["AI Cores", .25], ["RealEstate", .25], ["Robots", .25]], // FROM PROD CHART
            reFac: 0.3, sciFac: 0.26, hwFac: 0.4, robFac: 0.45, aiFac: 0.45, advFac: 0.06,
            reqMats: { "Energy": 0.8 }, incFac: 9, upFac: 5
        },
        {
            name: "Food",
            makesProducts: true, prodMats: [],
            materialRatio: [["Hardware", 0], ["AI Cores", .25], ["RealEstate", 0], ["Robots", .25]], // from chart
            reFac: 0.05, sciFac: 0.12, hwFac: 0.15, robFac: 0.3, aiFac: 0.25, advFac: 0.25,
            reqMats: { "Food": 0.5, "Water": 0.5, "Energy": 0.2 }, incFac: 9, upFac: 5
        },
        {
            name: "Tobacco",
            makesProducts: true, prodMats: [],
            materialRatio: [["Hardware", 0], ["AI Cores", 0], ["RealEstate", 0], ["Robots", .25]], //from chart
            reFac: 0.15, sciFac: 0.75, hwFac: 0.15, robFac: 0.2, aiFac: 0.15, advFac: 0.2,
            reqMats: { "Plants": 1, "Water": 0.2 }, incFac: 9, upFac: 5
        },
        {
            name: "Chemical",
            makesProducts: false, prodMats: ["Chemicals"],
            materialRatio: [["Hardware", .25], ["AI Cores", .25], ["RealEstate", .25], ["Robots", .25]], // from chart
            reFac: 0.25, sciFac: 0.75, hwFac: 0.2, robFac: 0.25, aiFac: 0.2, advFac: 0.07,
            reqMats: { "Plants": 1, "Energy": 0.5, "Water": 0.5 }, incFac: 9, upFac: 5
        },
        {
            name: "Pharmaceutical",
            makesProducts: true, prodMats: ["Drugs"],
            materialRatio: [["Hardware", .25], ["AI Cores", .25], ["RealEstate", .25], ["Robots", .25]], //verified
            reFac: 0.05, sciFac: 0.8, hwFac: 0.15, robFac: 0.25, aiFac: 0.2, advFac: 0.16,
            reqMats: { "Water": 0.5, "Energy": 1, "Chemicals": 2 }, incFac: 9, upFac: 5
        },
        {
            name: "Computer",
            makesProducts: true, prodMats: ["Hardware"],
            materialRatio: [["Hardware", 0], ["AI Cores", .15], ["RealEstate", .20], ["Robots", .30]],
            reFac: 0.2, sciFac: 0.62, hwFac: 0, robFac: 0.36, aiFac: 0.19, advFac: 0.17,
            reqMats: { "Energy": 1, "Metal": 2 }, incFac: 9, upFac: 5
        },
        {
            name: "Robotics",
            makesProducts: true, prodMats: ["Robots"],
            materialRatio: [["Hardware", 0], ["AI Cores", 0], ["RealEstate", .25], ["Robots", 0]],
            reFac: 0.32, sciFac: 0.65, hwFac: 0.19, robFac: 0, aiFac: 0.36, advFac: 0.18,
            reqMats: { "Hardware": 5, "Energy": 3 }, incFac: 9, upFac: 5
        },
        {
            name: "Software",
            makesProducts: true, prodMats: ["AI Cores"],
            materialRatio: [["Hardware", 0], ["AI Cores", 0], ["RealEstate", .1], ["Robots", .15]],
            reFac: 0.15, sciFac: 0.62, hwFac: 0.25, robFac: 0.05, aiFac: 0.18, advFac: 0.16,
            reqMats: { "Hardware": 0.5, "Energy": 0.5 }, incFac: 9, upFac: 5
        },
        {
            name: "Healthcare",
            makesProducts: true, prodMats: [],
            materialRatio: [["Hardware", .25], ["AI Cores", 0], ["RealEstate", .25], ["Robots", 0]],
            reFac: 0.1, sciFac: 0.75, hwFac: 0.1, robFac: 0.1, aiFac: 0.1, advFac: 0.11,
            reqMats: { "Robots": 10, "AICores": 5, "Energy": 5, "Water": 5 }, incFac: 9, upFac: 5
        },
        {
            name: "RealEstate",
            makesProducts: true, prodMats: ["RealEstate"],
            materialRatio: [["Hardware", 0], ["AI Cores", .25], ["RealEstate", 0], ["Robots", .25]],
            reFac: 0, sciFac: 0.05, hwFac: 0.05, robFac: 0.6, aiFac: 0.6, advFac: 0.25,
            reqMats: { "Metal": 5, "Energy": 5, "Water": 2, "Hardware": 4 }, incFac: 9, upFac: 5
        },
    ];

    let materialSizes = {
        "Water": 0.05,
        "Energy": 0.01,
        "Food": 0.03,
        "Plants": 0.05,
        "Metal": 0.1,
        "Hardware": 0.06,
        "Chemicals": 0.05,
        "Drugs": 0.02,
        "Robots": 0.5,
        "AI Cores": 0.1,
        "RealEstate": 0.005,
    }
    let warehouseMaterialDB = [
        { name: "Hardware", size: 0.06 },
        { name: "Robots", size: 0.5 },
        { name: "AI Cores", size: 0.1 },
        { name: "RealEstate", size: 0.005 }
    ]




    const logBase = (n, base) => Math.log(n) / Math.log(base);
    let materials = [];
    let wh_size = 0;
    let wh_size_used = 0; //get the amt of the wh currently used
    let wh_percent_used = 0;
    let upgradeScale = 0; // 10000
    //let maintLoopCounter = 0;
    let bonusTime = 10 // 10 for normal timing, but if you are in bonus time this is 100. no API method to indicate bonus time outside gang API
    let warehouse = corp.getWarehouse(div, cityName)

    async function updateBaseData(ns) {
        corp1 = corp.getCorporation();
        profit = (corp1.revenue - corp1.expenses);
        division = corp.getDivision(div);
        warehouse = corp.getWarehouse(divname, cityName)
        upgradeScale = logBase(phase + 8, industryDB.find(d => d.name == division.type).incFac);
        incomeThreshold = Math.pow(1.5e6, upgradeScale);
        upgradeSpeed = 1 / logBase(phase + 10, industryDB.find(d => d.name == division.type).upFac) / 10;
        materials = industryDB.find(d => d.name == division.type).materialRatio;
        makesProds = industryDB.find(d => d.name == division.name).makesProducts;
        prodmats = industryDB.find(d => d.name == division.name).prodMats;
        warehouseMaterialDB.forEach(m => m.currentstock = corp.getMaterial(div, cityName, m.name).qty)
        warehouseMaterialDB.forEach(m => m.whSize = m.currentstock * m.size)
        warehouseMaterialDB.forEach(m => m.whPercent = (m.whSize / warehouse.size) * 100)
        warehouseMaterialDB.forEach(m => m.desiredStock = (((warehouse.size / 2) * materials.find(n => n[0] == m.name)[1]) / m.size))
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    
    UPDATE Stat database
    cant use this function until corp/divs created. 
    */

    async function updateEmpMeta(ns, divname, cityName) {

        updateBaseData(ns);
        wh_size = corp.getWarehouse(divname, cityName).size; //get the current wh size
        wh_size_used = corp.getWarehouse(divname, cityName).sizeUsed; //get the amt of the wh currently used
        wh_percent_used = Math.round((wh_size_used / wh_size) * 100);

    }

    updateBaseData(ns)

    let divname = div;
    materials = industryDB.find(d => d.name == division.type).materialRatio;
    //	ns.print(`${material} -- ${materials} -- ${materials.find(n => n[0] == material)[1]} `)
    let purchase_timing_interval = 10000;
    let amt_proportion = 1 / (purchase_timing_interval / (purchase_timing_interval / bonusTime))
    let factor = 1;
    //for (let material of materials) {
    updateEmpMeta(ns, divname, cityName);
    // how many units of this material in the warehouse
    let currentstock = (corp.getMaterial(divname, cityName, material).qty);
    // what is our target stock volume. (half the warehouse space * the percent of availble space for that material divided by the material size)
    let desiredStock = (((wh_size / 2) * materials.find(n => n[0] == material)[1]) / materialSizes[material]) * Math.pow(factor, factor);
    // how much we need to change stock by
    let amt = Math.abs(desiredStock - currentstock);
    let loopcount = 0;
    //ns.tprint(`Materials Script running...`)
    while (currentstock > desiredStock * 1.1 || currentstock < desiredStock * 0.9) {
        loopcount += 1;
        loopcount % 3 == 0 && bonusTime == 10 ? bonusTime = 100 : bonusTime;
        loopcount % 6 == 0 && bonusTime == 100 ? bonusTime = 10 : bonusTime;
        //ns.print(`bonusTime: ${bonusTime}`)
        if (loopcount % 5) {
            await corp.sellMaterial(divname, cityName, material, "", "");
            await corp.buyMaterial(divname, cityName, material, 0);
        }

        //amt = desiredStock - currentstock;
        //ns.print(`loopcount: ${loopcount}`)
        //ns.print(`amt:${amt}  = desiredStock:${desiredStock} - currentstock:${currentstock}`)
        //ns.print(`wh_percent_used: ${wh_percent_used}`)
        let switchStatus = "";
        if (desiredStock == currentstock) {
            switchStatus = "nothing"
            //ns.print(`switchStatus: ${switchStatus}`)
        } else if (desiredStock < currentstock) {
            switchStatus = "sell"
            //ns.print(`switchStatus: ${switchStatus}`)
        } else if (desiredStock > currentstock) {
            switchStatus = "buy"
            //ns.print(`switchStatus: ${switchStatus}`)
        }

        amt_proportion = 1 / (purchase_timing_interval / (purchase_timing_interval / bonusTime))
        let perSecAmt = amt * amt_proportion;
        //		ns.print(`amt_proportion: ${amt_proportion}`)
        //		ns.print(`perSecAmt: ${perSecAmt}`)
        //ns.print(`switchStatus: ${switchStatus}`)

        switch (switchStatus) {

            case "buy":
                ns.print(`INFO: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: BUYING ${material} @ ${(amt * amt_proportion).toFixed(2)} - %${((currentstock / desiredStock) * 100).toFixed(1)}`);
                await corp.buyMaterial(divname, cityName, material, (perSecAmt));
                await ns.sleep(purchase_timing_interval);
                await corp.buyMaterial(divname, cityName, material, 0) //reset to 0 after buy cycle
                //currentstock = corp.getMaterial(divname, cityName, material[0]).qty
                break

            case "sell":
                ns.print(`INFO: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: SELLING ${material} @ ${-amt.toFixed(2)} - %${((currentstock / desiredStock) * 100).toFixed(1)}`)
                await corp.sellMaterial(divname, cityName, material, perSecAmt, "0");
                await ns.sleep(purchase_timing_interval);
                await corp.sellMaterial(divname, cityName, material, "", "")
                //currentstock = corp.getMaterial(divname, cityName, material[0]).qty
                break;

            case "nothing":
                ns.print(`INFO: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: ${material} stock optimized. no changes needed `)
                //await ns.sleep(purchase_timing_interval / 10)
                break;
        }


        //ns.print(`FAILURE: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}:  ${material[0]} INFINITE LOOP CATCHER `)
        await ns.sleep(purchase_timing_interval / 10);


        currentstock = (corp.getMaterial(divname, cityName, material).qty);
        desiredStock = (((wh_size / 2) * materials.find(n => n[0] == material)[1]) / materialSizes[material]) * Math.pow(factor, factor);
        updateBaseData(ns);
        updateEmpMeta(ns, divname, cityName);
        //await whUpgrader(ns, divname, cityName);

    }
    //}

}
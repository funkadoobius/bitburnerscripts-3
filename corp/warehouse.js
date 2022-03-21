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
    let maintLoopCounter = args[`loop`]
    //const rootname = "FUBAR";
    //let player = ns.getPlayer();

    //const cities = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"];

    const corp = eval("ns.corporation"); ///shhhh
    let corp1 = corp.getCorporation(); // corp1 stats
    let division = corp.getDivision(div);
    /////////////////////////////////////////////////////////////////////////////////////////////

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

    let industryDBkeys = Object.keys(industryDB);

    let employeeDB = [];

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

    /*
        let jobStats = [
            { name: "Engineer", "1": 0.2, "2": 0.2, "3": 0.2, primeStat: "exp" },
            { name: "Research & Development", "1": 0.1, "2": 0.2, "3": 0.2, primeStat: "int" },
            { name: "Operations", "1": 0.5, "2": 0.5, "3": 0.45, primeStat: "eff" },
            { name: "Management", "1": 0.1, "2": 0.05, "3": 0.05, primeStat: "cha" },//management has cha priority in ordering
            { name: "Business", "1": 0.1, "2": 0.05, "3": 0.05, primeStat: "cha" },
            { name: "Training", "1": 0, "2": 0, "3": .05, primeStat: "" }
        ]
    */

    let employeeMeta = {
        "Total": 0,
        "Research & Development": 0,
        "Business": 0,
        "Engineer": 0,
        "Management": 0,
        "Operations": 0,
        "Training": 0
    };


    const logBase = (n, base) => Math.log(n) / Math.log(base);

    //let corpUpgrades = ["Smart Factories", "Smart Storage", "FocusWires", "Neural Accelerators", "Speech Processor Implants", "Nuoptimal Nootropic Injector Implants", "Wilson Analytics",
    //"DreamSense", "ABC SalesBots"];

    //let corpUnlockables = ["Smart Supply"]

    let materials = [];


    let incomeThreshold = 0;
    let wh_size = 0;
    let wh_size_used = 0; //get the amt of the wh currently used
    let wh_percent_used = 0;
    let upgradeScale = 0; // 10000
    let profit = 0;
    let upgradeSpeed = 0;
    //let maintLoopCounter = 0;
    let makesProds = false;
    let bonusTime = 10 // 10 for normal timing, but if you are in bonus time this is 100. no API method to indicate bonus time outside gang API

    let prodmats = [];

    async function updateBaseData(ns) {
        //ns.print(`TEST1`)
        //ns.print(`Resetting corp/div objects....`);
        corp1 = corp.getCorporation();
        //ns.print(`TEST2`)
        profit = (corp1.revenue - corp1.expenses);
        //ns.print(`TEST3`)
        //player = corp.getPlayer();
        //ns.print(`TEST4`)
        division = corp.getDivision(div);
        //ns.print(`TEST5`)
        upgradeScale = logBase(phase + 8, industryDB.find(d => d.name == division.type).incFac);
        // ns.print(`upgradeScale: ${upgradeScale}`);
        incomeThreshold = Math.pow(1.5e6, upgradeScale);
        //ns.print(upgradeScale)
        //ns.print(incomeThreshold)
        //ns.print(`incomeThreshold: ${incomeThreshold}`);
        upgradeSpeed = 1 / logBase(phase + 10, industryDB.find(d => d.name == division.type).upFac) / 10;
        //ns.print(`upgradeSpeed: ${upgradeSpeed}`);
        materials = industryDB.find(d => d.name == division.type).materialRatio;

        makesProds = industryDB.find(d => d.name == division.name).makesProducts;

        prodmats = industryDB.find(d => d.name == division.name).prodMats;

    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    
    UPDATE Stat database
    cant use this function until corp/divs created. 
    */

    async function updateEmpMeta(ns, divname, cityName) {

        updateBaseData(ns);
        let office = corp.getOffice(divname, cityName);
        //ns.print(`Rebuilding Employee Database....`);
        employeeDB = [];
        office.employees.forEach(name => {
            let tempEmployee = corp.getEmployee(divname, cityName, name);
            employeeDB.push(tempEmployee);
        });

        wh_size = corp.getWarehouse(divname, cityName).size; //get the current wh size
        wh_size_used = corp.getWarehouse(divname, cityName).sizeUsed; //get the amt of the wh currently used
        wh_percent_used = Math.round((wh_size_used / wh_size) * 100);

        // compile some useful meta

        employeeMeta = {
            "Total": 0,
            "Research & Development": 0,
            "Business": 0,
            "Engineer": 0,
            "Management": 0,
            "Operations": 0,
            "Training": 0
        };
        let sumHap = 0;
        let sumEne = 0;
        let avgHap = 0;
        let avgEne = 0;

        for (let employee of employeeDB) {
            employeeMeta.Total += 1;
            employeeMeta[employee.pos] += 1; //position counter
            sumHap += employee.hap;
            sumEne += employee.ene;
        }
        avgHap = sumHap / employeeDB.length;
        avgEne = sumEne / employeeDB.length;

        employeeMeta.avgHap = avgHap;
        employeeMeta.avgEne = avgEne;
    }

    //let execute = eval("ns.exec")


    updateBaseData(ns)


    let divname = div





    /*
     whUpgrader(division name, city name)
     increase the size of the warehouse, based on phase, 
     */


    updateBaseData(ns);

    if (!corp.hasWarehouse(divname, cityName)) {
        ns.print(`${cityName}: No warehouse found. creating one`)
        if (corp.getPurchaseWarehouseCost() < corp1.funds) {
            await corp.purchaseWarehouse(divname, cityName);
            ns.print(`SUCCESS: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}:  warehouse created `);

        } else {
            ns.print(`FAILED: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: Insufficient funds to Purchase Warehouse`);
            return;
        }
    } //else ns.print(`SUCCESS: ${cityName} warehouse exists`)

    updateEmpMeta(ns, divname, cityName);


    ns.print(`INFO: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}:  - Warehouse is ${wh_size} units @ ${wh_percent_used}% utilized `)



    while (wh_percent_used > 95) { // if the wh is too small based on utilization of 
        //ns.print(`${cityName}: Warehouse updgrade needed.`)
        //ns.print(corp.getUpgradeWarehouseCost(divname, cityName)) 

        // UPGRADE the warehouse
        if (corp.getUpgradeWarehouseCost(divname, cityName) < corp1.funds * upgradeSpeed * 3) {
            await corp.upgradeWarehouse(divname, cityName);
            ns.print(`SUCCESS: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: Warehouse upgraded. `)

            // reload wh stats before looping, ITERATOR
            updateEmpMeta(ns, divname, cityName);
            ns.print(`INFO: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: ${cityName} - Warehouse is  ${wh_percent_used}%utilized `)
            //ns.print(`${cityName} - Warehouse is ${wh_size}, ${wh_percent_used}%utilized `)
            // await ns.sleep(1006);
        } else break;

        await ns.sleep(1015);
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////






    //ns.print(`${cityName}: Getting materials...`)
    updateBaseData(ns);

    /*if (wh_size > 10000) {
        ns.tprint(`INFO: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: WH Stock no longer needs management.`);
        //return;
    }*/

    let purchase_timing_interval = 10000;
    let amt_proportion = 1 / (purchase_timing_interval / (purchase_timing_interval / bonusTime))
    let factor = 1;
    wh_size > 6000 ? factor = upgradeSpeed : factor = 1;

    if (wh_percent_used > 99) {
        for (let material of materials) {
            await corp.sellMaterial(divname, cityName, material[0], "", "");
            await corp.buyMaterial(divname, cityName, material[0], 0);
        }
        //await whUpgrader(ns, divname, cityName);
    }




    for (let material of materials) {

        // All helpers should be launched at home since they use tempory scripts, and we only reserve ram on home
        if (!ns.isRunning("materials.js", "home", "--div", division.name, "--city", cityName, "--mat", material[0], "--phase", phase, "--loop", maintLoopCounter)) {//...["--div", division.name, "--city", cityName, "--mat", material[0]]

            ns.print(`materials.js not running for ${material[0]} in ${cityName}`)
            let pid = ns.exec("/corp/materials.js", "home", 1, "--div", division.name, "--city", cityName, "--mat", material[0], "--phase", phase, "--loop", maintLoopCounter);
            //ns.tail(pid)
            //ns.print(`Started Material Manager with PID ${pid}`);
            await ns.sleep(100);
        } else ns.print(`/corp/materials.js IS running for ${material[0]} in ${cityName}`)
    }


    updateEmpMeta(ns, division.name, cityName);
    let productName = division.name.concat("-", Math.ceil((Math.random() + Math.random()) * 10));
    let designInvest = corp1.funds > 1e20 ? 1e12 : 1e9;
    let marketingInvest = corp1.funds > 1e20 ? 1e12 : 1e9;
    let products = division.products;
    let hasTA2 = corp.hasResearched(division.name, "Market-TA.II");
    let prodMeta = [];
    let choppingBlock = []
    let maxProducts = corp.hasResearched(division.name, "uPgrade: Capacity.I") ? 4 : 3;

    prodmats = industryDB.find(d => d.name == division.type).prodMats;
    if (prodmats.length >= 1) {
        for (let mat of prodmats) {
            updateBaseData(ns);
            ns.print(`SUCCESS:${division.name} Checking ${mat} in ${cityName} `);
            if (hasTA2) {
                //
                await corp.sellMaterial(division.name, cityName, mat, "MAX", "MP");
                ns.print(`SUCCESS: ${division.name} PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}${mat} set to be sold`);
                await corp.setMaterialMarketTA1(division.name, cityName, mat, true);
                await corp.setMaterialMarketTA2(division.name, cityName, mat, true);
                ns.print(`SUCCESS: ${division.name} PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}Market-TA.II set for ${mat}`);

            } else if (mat.length >= 1) {

                await corp.sellMaterial(division.name, cityName, mat, "MAX", "MP");
                ns.print(`SUCCESS:${division.name} PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName} ${mat} set to be sold`);
            }
        }

    }


    if (industryDB.find(d => d.name == division.name).makesProducts) {


        while (products.includes(productName)) {
            productName = division.name.concat("-", Math.ceil((Math.random() + Math.random()) * 10))
        }
        if (makesProds) {

            for (let p of products) {
                let prod = corp.getProduct(division.name, p)
                if (prod.developmentProgress > 100) prodMeta.push(prod);
            }
            prodMeta.length !== 0 ? choppingBlock = prodMeta.sort(dynamicSort("dmd")) : choppingBlock;

            if (products.length <= maxProducts - 1) {
                corp.makeProduct(division.name, cityName, productName, designInvest, marketingInvest);
                ns.print(`SUCCESS: ${division.name} PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName} Product ${productName} created. `);

            } else if (prodMeta.length >= maxProducts) {
                corp.discontinueProduct(division.name, choppingBlock[choppingBlock.length - 1].name)
                ns.print(`SUCCESS: ${division.name} PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName} Product ${choppingBlock[choppingBlock.length - 1].name} DISCONTINUED`);
            }

            if (prodMeta.length >= 1 && prodMeta.length <= maxProducts - 1) {
                for (let product of prodMeta) {
                    //ns.print(`INFO: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName} Product ${product.name} loaded. `);

                    if (hasTA2) {
                        // 
                        corp.sellProduct(division.name, cityName, product.name, "MAX", "MP", true)
                        ns.print(`SUCCESS: ${division.name} PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName} ${product.name} set to be sold`);
                        corp.setProductMarketTA1(division.name, product.name, true)
                        corp.setProductMarketTA2(division.name, product.name, true);
                        ns.print(`SUCCESS: ${division.name} PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName} Market-TA.II set for ${product.name}`);
                    } else {
                        corp.sellProduct(division.name, cityName, product.name, "MAX", "MP", true)
                        ns.print(`SUCCESS: ${division.name} PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName} ${product.name} set to be sold in ${cityName}`);
                    }

                }
            }
        }

    }

    ///////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////////////////////




















}
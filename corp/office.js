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
    ['shuffle', false],
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
    let shuffle = args[`shuffle`]
    //const rootname = "FUBAR";
    //let player = ns.getPlayer();
    let maintLoopCounter = args[`loop`]
    //const cities = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"];

    const corp = eval("ns.corporation"); ///shhhh

    let corp1 = corp.getCorporation(); // corp1 stats


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


    let jobStats = [
        { name: "Engineer", "1": 0.2, "2": 0.2, "3": 0.2, primeStat: "exp" },
        { name: "Research & Development", "1": 0.1, "2": 0.2, "3": 0.2, primeStat: "int" },
        { name: "Operations", "1": 0.5, "2": 0.5, "3": 0.45, primeStat: "eff" },
        { name: "Management", "1": 0.1, "2": 0.05, "3": 0.05, primeStat: "cha" },//management has cha priority in ordering
        { name: "Business", "1": 0.1, "2": 0.05, "3": 0.05, primeStat: "cha" },
        { name: "Training", "1": 0, "2": 0, "3": .05, primeStat: "" }
    ]


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
        //ns.ttprint(`TEST1`)
        //ns.ttprint(`Resetting corp/div objects....`);
        corp1 = corp.getCorporation();
        //ns.ttprint(`TEST2`)
        profit = (corp1.revenue - corp1.expenses);
        //ns.ttprint(`TEST3`)
        //player = corp.getPlayer();
        //ns.ttprint(`TEST4`)
        division = corp.getDivision(div);
        //ns.ttprint(`TEST5`)
        upgradeScale = logBase(phase + 8, industryDB.find(d => d.name == division.type).incFac);
        // ns.ttprint(`upgradeScale: ${upgradeScale}`);
        incomeThreshold = Math.pow(1.5e6, upgradeScale);
        //ns.ttprint(upgradeScale)
        //ns.ttprint(incomeThreshold)
        //ns.ttprint(`incomeThreshold: ${incomeThreshold}`);
        upgradeSpeed = 0.7//1 / logBase(phase + 10, industryDB.find(d => d.name == division.type).upFac) / 10;
        //ns.ttprint(`upgradeSpeed: ${upgradeSpeed}`);
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
        //ns.ttprint(`Rebuilding Employee Database....`);
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





    updateEmpMeta(ns, divname, cityName);

    ns.tprint(`PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: Checking for office upgrades...`);

    let thisOffice = corp.getOffice(divname, cityName);
    let upgradeSize = 10;
    /*
        if (corp.getOfficeSizeUpgradeCost(divname, cityName, 10) < corp1.funds * upgradeSpeed) {
            await corp.upgradeOfficeSize(divname, cityName, upgradeSize);
        }*/
    //ns.tttprint(`upgradeSpeed: ${upgradeSpeed}`);
    let cost = corp.getOfficeSizeUpgradeCost(divname, cityName, upgradeSize)

    ns.tprint(`MATH: ${formatMoney(cost)} < ${formatMoney(corp1.funds * .7)}`)
    if (cost < (corp1.funds * 0.4) && employeeMeta.avgEne > 99.99 && employeeMeta.avgHap > 99.99) {
        ns.tprint(`PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: Office upgrades available. Happiness and Energy recovered`);
        if (await corp.upgradeOfficeSize(divname, cityName, upgradeSize)) {
            ns.tprint(`SUCCESS: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: : added ${upgradeSize} cubicles to office `);
        } else ns.tprint(`FAILED: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: : could not add ${upgradeSize} cubicles to office `);

        await ns.sleep(1007);

    }

    //ns.ttprint(`INFO: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}:  Insufficient Funds. cost ${cost.toFixed(2)} greater than ${(corp1.funds * upgradeSpeed).toFixed(2)}`)


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    fillOffice(division name, city name)
    fill all open positions in the specified office, then iterate through a 3d array to auto assign employees to positions, determined by phase
    */

    updateEmpMeta(ns, divname, cityName);
    //ns.ttprint(`${cityName}: Hiring employees to fill the office...`);
    thisOffice = corp.getOffice(divname, cityName);
    let i = thisOffice.employees.length;
    let newhires = thisOffice.size - i;
    ns.tprint(`INFO: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}:  Current employees: ${i}, of ${thisOffice.size}. ${newhires}  newhires needed`);


    while (i < thisOffice.size) {
        await corp.hireEmployee(divname, cityName);
        i++;
        ns.tprint(`SUCCESS: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}:  hired employee ${i} of ${thisOffice.size}`);
        await ns.sleep(100);
    }



    //////////////////////////////////////////////////////////////////////////////////////////////////////////////




    updateEmpMeta(ns, div, cityName);
    if (shuffle) {
        for (let employee of employeeDB) {
            await corp.assignJob(div, cityName, employee.name, "Unassigned")
            // load all of the employee objects into an a await whUpgrader(ns, divname, cityName);mployee.name, "Unassigned")
            ns.tprint(`INFO: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName} Unassigned ${employee.name} to be reassigned a new job.`)
            await ns.sleep(1010);
        }
    }

    // look for the best cadidates for each job
    for (let job of jobStats) { // change order of jobstats array to prioritize one job over another.

        let employeeTemp = employeeDB.sort(dynamicSort(job.primeStat))
        let tempphase = 0;

        phase > 3 ? tempphase = 3 : tempphase = phase;

        let jobTarget = Math.round(job[tempphase] * employeeMeta.Total);

        for (let employee of employeeTemp) {
            //ns.ttprint(`${employee.pos}`)

            if ((employee.pos == "Training" || employee.pos == "Unassigned") && employeeMeta[job.name] < jobTarget) {

                await corp.assignJob(div, cityName, employee.name, job.name)
                ns.tprint(`SUCCESS: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: ${employeeMeta[job.name] + 1} of ${jobTarget}`);
                ns.tprint(`INFO: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: Assigning Name: ${employee.name} - ${job.primeStat} = ${employee[job.primeStat]} to ${job.name}`);
                employeeDB[employee.pos] = job.name;

                employeeMeta[job.name] += 1;
                await ns.sleep(1010);

            }

        };

        updateEmpMeta(ns, div, cityName);
    }





    ///////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////////////////////




















}
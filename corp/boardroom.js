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
    ['phase', 1],
    ['div', "Agriculture"]
];
export function autocomplete(data, args) {
    data.flags(argsSchema);
    return [];
}



export async function main(ns) {


    let args = ns.flags(argsSchema);
    let phase = args[`phase`]; // args[0];
    let div = args[`div`];
    const rootname = "FUBAR";
    let player = ns.getPlayer();


    const cities = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"];

    const corp = eval("ns.corporation"); ///shhhh

    let asynchronousHelpers = [
        { name: "stats.js", shouldRun: () => ns.getServerMaxRam("home") >= 64 /* Don't waste precious RAM */ }, // Adds stats not usually in the HUD
        { name: "hacknet-upgrade-manager.js", args: ["-c", "--max-payoff-time", "1h"] }, // Kickstart hash income by buying everything with up to 1h payoff time immediately
        { name: "stockmaster.js", args: ["--show-market-summary"], tail: true, shouldRun: () => playerStats.hasTixApiAccess }, // Start our stockmaster if we have the required stockmarket access
        { name: "gangs.js", tail: true, shouldRun: () => 2 in dictSourceFiles }, // Script to create manage our gang for us
        { name: "spend-hacknet-hashes.js", args: ["-v"], shouldRun: () => 9 in dictSourceFiles }, // Always have this running to make sure hashes aren't wasted
        { name: "sleeve.js", tail: true, shouldRun: () => 10 in dictSourceFiles }, // Script to create manage our sleeves for us
        {
            name: "work-for-factions.js", args: ['--fast-crimes-only', '--no-coding-contracts'],  // Singularity script to manage how we use our "focus" work.
            shouldRun: () => 4 in dictSourceFiles && (ns.getServerMaxRam("home") >= 128 / (2 ** dictSourceFiles[4])) // Higher SF4 levels result in lower RAM requirements
        },
    ];
    asynchronousHelpers.forEach(helper => helper.name = getFilePath(helper.name));
    asynchronousHelpers.forEach(helper => helper.isLaunched = false);
    asynchronousHelpers.forEach(helper => helper.requiredServer = "home"); // All helpers should be launched at home since they use tempory scripts, and we only reserve ram on home


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

    let corpUpgrades = ["Smart Factories", "Smart Storage", "FocusWires", "Neural Accelerators", "Speech Processor Implants", "Nuoptimal Nootropic Injector Implants", "Wilson Analytics",
        "DreamSense", "ABC SalesBots"];

    let corpUnlockables = ["Smart Supply"]

    let materials = [];


    let incomeThreshold = 0;
    let wh_size = 0;
    let wh_size_used = 0; //get the amt of the wh currently used
    let wh_percent_used = 0;
    let upgradeScale = 0; // 10000
    let profit = 0;
    let upgradeSpeed = 0;
    let maintLoopCounter = 0;
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


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    createIndustry() 
    check for the presence of a particular industry based on a list array. if not found, create it.
    */

    function createIndustry(ns, div) {

        updateBaseData(ns);; //refresh corp1 stats

        var existingDivisions = [];

        corp1.divisions.forEach(d => {
            existingDivisions.push(d.name);
            // ns.print(d.name, " - ", div, " added to array.");
        });

        if (!existingDivisions.includes(div)) {
            ns.print(`Checking for funds to expand industry...`);
            if (corp.getExpandIndustryCost(div) < corp1.funds) {
                //ns.print("corp.getExpandIndustryCost(div) - ", corp.getExpandIndustryCost(div));

                ns.print("Creating Industry...");
                corp.expandIndustry(div, div);
                ns.print("SUCCESS");

            } else ns.print("FAILED: insufficient funds to create industry. - ", div);


        } else ns.print("SUCCESS: Division already exists.");


    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function advertise(ns, div, force) {
        updateBaseData(ns);

        if (force) {
            corp.hireAdVert(div);
            ns.print(`INFO: FORCED Purchasing Advertisements .....`)
        }

        if (corp.getHireAdVertCost(div) < corp1.funds * upgradeSpeed) {
            corp.hireAdVert(div);
            ns.print(`SUCCESS: advertising level increased...`)
        } else ns.print(`FAILED: Insufficient funds to hire AdVert`);


    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async function hrDept(ns, div, cityName, shuffle) {
        updateEmpMeta(ns, div, cityName);
        if (shuffle) {
            for (let employee of employeeDB) {
                await corp.assignJob(div, cityName, employee.name, "Unassigned")
                // load all of the employee objects into an a await whUpgrader(ns, divname, cityName);mployee.name, "Unassigned")
                ns.print(`INFO: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName} Unassigned ${employee.name} to be reassigned a new job.`)
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
                //ns.print(`${employee.pos}`)

                if ((employee.pos == "Training" || employee.pos == "Unassigned") && employeeMeta[job.name] < jobTarget) {

                    await corp.assignJob(div, cityName, employee.name, job.name)
                    ns.print(`SUCCESS: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: ${employeeMeta[job.name] + 1} of ${jobTarget}`);
                    ns.print(`INFO: PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: Assigning Name: ${employee.name} - ${job.primeStat} = ${employee[job.primeStat]} to ${job.name}`);
                    employeeDB[employee.pos] = job.name;

                    employeeMeta[job.name] += 1;
                    await ns.sleep(1010);

                }

            };

            updateEmpMeta(ns, div, cityName);
        }

    }

    /////////////////////////////////////////////////////////////////////////////////////////////

    async function headResearcher(ns, divname) {
        updateBaseData(ns);

        let researchOrder = ["Hi-Tech R&D Laboratory", "Drones", "Automatic Drug Administration", "Overclock", "Drones - Assembly",
            "Self-Correcting Assemblers", "CPH4 Injections", "Drones - Transport", "Market-TA.I", "Market-TA.II"];

        let currentResearchAmt = division.research;
        for (let science of researchOrder) {
            if (corp.hasResearched(divname, science)) {
                ns.print(`INFO: PHASE/LOOP:${phase}/${maintLoopCounter} ${science} already complete.`)
            }
            let researchCost = corp.getResearchCost(divname, science);
            if (currentResearchAmt - researchCost > 10000 && !corp.hasResearched(divname, science)) {
                corp.research(divname, science);
                ns.print(`SUCCESS: PHASE/LOOP:${phase}/${maintLoopCounter}  Research completed: ${science}`);
                return;
            } else if (!corp.hasResearched(divname, science)) {

                ns.print(`INFO: PHASE/LOOP:${phase}/${maintLoopCounter} Research still pending: ${science}`);
            }
        }




    }
    /////////////////////////////////////////////////////////////////////////////////////////////




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






    /* ================================------------------- MAIN ---------------------====================================
     
                                                         PHASE ONE
     
        Create a corp. determine if you can self fund, or if youre in BN3.
    */

    player = ns.getPlayer(); // refresh player data
    const selfFund = player.money >= 1.5e11
    let worked = false;
    if (!player.hascorp) {
        //player.bitNodeN != 3
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



    /*
     buildDivision(divIndex)
     build a division and expand in each city, accepts the index number of the desired division from the preferred industry list. start with 0
     then make a warehouse if we can afford it.     then set basic sales
     
    //build a division, set up the inicial warehouse, and the selling of products
    //purchase inicial ulockables
    //buildDivision(ns, 0);
     */

    let corp1 = corp.getCorporation(); // corp1 stats


    await createIndustry(ns, div); // create the first industry

    let division = corp.getDivision(div); // load div info 


    /* Get smart supply
     */
    ns.print("Checking for unlockable upgrades ...");
    for (let unlock of corpUnlockables) { // purchase corp1 unlocks based on the list, like smart supply
        if (!corp.hasUnlockUpgrade(unlock)) {
            corp.unlockUpgrade(unlock);
            ns.print(unlock, " unlocked.");
        } else ns.print(unlock, " already unlocked.");

    }

    /*Expand the division to all citites
    also do the initial warehouse creation so we are not accidentally left with an office without a warehouse
    also set thei initial product sale amounts
    */

    //ns.print(division.cities);
    // ns.print(`Division is in ${division.cities.length} cities, needs to be in ${cities.length}`);
    if (division.cities.length <= cities.length) { // if the size of the array containing the cities this division is currently in is less than the total number of cites
        //ns.print("Start rolling through cities ....");
        await advertise(ns, division.name);
        await ns.sleep(1002);



        for (let cityName of cities) { // iterate through the full list of cities

            if (!division.cities.includes(cityName)) await corp.expandCity(division.name, cityName);

            //if the current city is not in the list of division cities and the expansion cost is ok
            updateBaseData(ns);
            if (!division.cities.includes(cityName)) {
                if (corp.getExpandCityCost() < corp1.funds) {
                    ns.print("Not in ", cityName, " yet, expanding....");
                    //expand into this city
                    corp.expandCity(division.name, cityName);
                    ns.print(division.name, " expanded into ", cityName);
                } else ns.print("FAILED: insufficient funds to expand ", division.name, " to ", cityName);
            } else ns.print(`SUCCESS: in ${cityName}, ${div} already exists.`);

            // check for a warehouse and if its affordable
            updateBaseData(ns);
            if (!corp.hasWarehouse(division.name, cityName)) {
                if (corp.getPurchaseWarehouseCost() < corp1.funds) {
                    corp.purchaseWarehouse(division.name, cityName); //make a warehouse 
                    ns.print("warehouse created in ", cityName);
                } else ns.print(`FAILED: Insufficient funds to Purchase Warehouse in ${cityName}`);
            } else if (corp.hasWarehouse(division.name, cityName)) {
                ns.print(`SUCCESS: Warehouse already exists in ${cityName}`);

                let warehouse = corp.getWarehouse(division.name, cityName);
                if (!warehouse.smartSupplyEnabled) {
                    updateBaseData(ns);
                    await corp.setSmartSupply(division.name, cityName, true);
                    ns.print("Smart Supply enabled for ", cityName);
                }

                updateBaseData(ns);

                let pid = ns.exec("/corp/warehouse.js", "home", 1, "--div", division.name, "--city", cityName, "--phase", phase, "--loop", maintLoopCounter);
                ns.print(`Started Warehouse Manager with PID ${pid} `);

            } else ns.print(`uknown error in warehouse creation`)

        }

        for (let cityName of cities) {
            let pid = ns.exec("/corp/office.js", "home", 1, "--div", division.name, "--city", cityName, "--phase", phase, "--loop", maintLoopCounter);
            ns.print(`Started Office Manager with PID ${pid}`);

            //await officeUpgrader(ns, division.name, cityName, false) // make the office bigger
            //await fillOffice(ns, division.name, cityName);//hire a round of emplyees 
            //await hrDept(ns, division.name, cityName, false); //assign people to the correct jobs
        }
        /*
                for (let cityName of cities) {
                    await productManager(ns, division.name, cityName);
                }
        
                for (let cityName of cities) {
                    await purchaseMaterials(ns, division.name, cityName);
                }
        */
        await ns.sleep(1005);
        updateBaseData(ns);
    }


    /// MAINTENANCE LOOP

    while (true) {
        maintLoopCounter += 1;
        ns.print(`BEGIN MAINTENANCE LOOP ---------PHASE ${phase} - LOOP ${maintLoopCounter}----------`)
        updateBaseData(ns);
        let bigMeta = [];


        profit = (corp1.revenue - corp1.expenses);
        ns.print(`PROFIT CHECK -------------- ${profit}:${incomeThreshold}`)
        ns.print(`Waiting on profit threshold of ${formatMoney(incomeThreshold)}, currently ${formatMoney(profit)} `);


        while (profit <= incomeThreshold) {
            updateBaseData(ns);
            ns.print(`INFO: Waiting on profit threshold of ${formatMoney(incomeThreshold)}, currently ${formatMoney(profit)} `);

            ns.print(`INFO: Checking for investment offers... <=========================`)
            if (getNoffer(ns)) {
                ns.print(`SUCCESS: Investment offer meets threshold and was accepted.`)
            }




            ns.print(`INFO: Attempting to purchase AdVert... <=========================`)
            if (corp.getHireAdVertCost(division.name) < corp1.funds * upgradeSpeed) {
                await advertise(ns, division.name, true)
                ns.print(`SUCCESS: AdVert Purchased`)
            }
            ns.print(`INFO: Checking for CORP level upgrades... <=========================`)
            await corpUpgrader(ns, true);
            ns.print(`INFO: Checking with R&D... <=========================`)
            await headResearcher(ns, division.name);

            updateBaseData(ns);


            for (let cityName of cities) {
                updateEmpMeta(ns, division.name, cityName);
                bigMeta.push(updateEmpMeta(ns, division.name, cityName));
                ns.print(`INFO: working on upgrades in ${cityName}... <=========================`)
                if (phase >= 4) {
                    let pid = ns.exec("/corp/office.js", "home", 1, "--div", division.name, "--city", cityName, "--phase", phase, "--loop", maintLoopCounter);
                    ns.print(`Started Office Manager with PID ${pid}`);

                }


                ns.print(`INFO: Assigning new employees... <=========================`)
                /*
                if (maintLoopCounter % 15 == 0) {
                    ns.print(maintLoopCounter)
                    ns.print(`Start Mass Re-assignment of Labor`)
                    await hrDept(ns, division.name, cityName, true); //assign people to the correct jobs
                    
                } else */await hrDept(ns, division.name, cityName, false);
                ns.print(`INFO: Checking for WAREHOUSE level upgrades... <=========================`)
                let pid = ns.exec("/corp/warehouse.js", "home", 1, "--div", division.name, "--city", cityName, "--phase", phase, "--loop", maintLoopCounter);
                ns.print(`Started Warehouse Manager with PID ${pid}`);


                //await productManager(ns, division.name, cityName);
                //await purchaseMaterials(ns, division.name, cityName);


            }
            /*
                        for (let cityName of cities) {
                            ns.print(`INFO: working on PRODUCTS in ${cityName}... <=========================`)
                            await productManager(ns, division.name, cityName);
                        }
            
                        for (let cityName of cities) {
                            ns.print(`INFO: working on MATERIALS in ${cityName}... <=========================`)
                            await purchaseMaterials(ns, division.name, cityName);
                        }
            */
            await ns.sleep(10002)
            updateBaseData(ns);

        }

        phase += 1; //advance to the next phase
        ns.print(`SUCCESS: PHASE ADVANCED TO ${phase}`)


        updateBaseData(ns);
        await ns.sleep(1)



    }
}
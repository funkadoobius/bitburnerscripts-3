/**  
 * 
 @param {NS} ns */
/* TODO

1. create objects for each division that include their phase settings, products that need to be sold (with settings),
and materials to put in the warehouse. this would replace switched 3d arrays.

*/

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


    let industryDB = [
        {
            name: "Energy",
            makesProducts: false, prodMats: ["Energy"],
            materialRatio: [["Hardware", 0], ["AI Cores", .20], ["Real Estate", .80], ["Robots", 0]], // based on charts
            reFac: 0.65, sciFac: 0.7, hwFac: 0, robFac: 0.05, aiFac: 0.3, advFac: 0.08,
            reqMats: { "Hardware": 0.1, "Metal": 0.2 }, incFac: 9, upFac: 5
        },

        {
            name: "Utilities",
            makesProducts: false, prodMats: ["Water"],
            materialRatio: [["Hardware", .25], ["AI Cores", .25], ["Real Estate", .25], ["Robots", .25]], // Based on charts
            reFac: 0.5, sciFac: 0.6, hwFac: 0, robFac: 0.4, aiFac: 0.4, advFac: 0.08,
            reqMats: { "Hardware": 0.1, "Metal": 0.1 }, incFac: 9, upFac: 5
        },

        {
            name: "Agriculture",
            makesProducts: false, prodMats: ["Plants", "Food"],
            materialRatio: [["Hardware", .1], ["AI Cores", .1], ["Real Estate", .7], ["Robots", .1]], // FROM PROD CHART
            reFac: 0.72, sciFac: 0.5, hwFac: 0.2, robFac: 0.3, aiFac: 0.3, advFac: 0.04,
            reqMats: { "Water": 0.5, "Energy": 0.5 }, incFac: 9, upFac: 5
        },

        {
            name: "Fishing",
            makesProducts: false, prodMats: ["Food"],
            materialRatio: [["Hardware", .3], ["AI Cores", .2], ["Real Estate", 0], ["Robots", .5]], // FROM PROD CHART
            reFac: 0.15, sciFac: 0.35, hwFac: 0.35, robFac: 0.5, aiFac: 0.2, advFac: 0.08,
            reqMats: { "Energy": 0.5 }, incFac: 9, upFac: 5
        },
        {
            name: "Mining",
            makesProducts: false, prodMats: ["Metal"],
            materialRatio: [["Hardware", .25], ["AI Cores", .25], ["Real Estate", .25], ["Robots", .25]], // FROM PROD CHART
            reFac: 0.3, sciFac: 0.26, hwFac: 0.4, robFac: 0.45, aiFac: 0.45, advFac: 0.06,
            reqMats: { "Energy": 0.8 }, incFac: 9, upFac: 5
        },
        {
            name: "Food",
            makesProducts: true, prodMats: [],
            materialRatio: [["Hardware", 0], ["AI Cores", .25], ["Real Estate", 0], ["Robots", .25]], // from chart
            reFac: 0.05, sciFac: 0.12, hwFac: 0.15, robFac: 0.3, aiFac: 0.25, advFac: 0.25,
            reqMats: { "Food": 0.5, "Water": 0.5, "Energy": 0.2 }, incFac: 9, upFac: 5
        },
        {
            name: "Tobacco",
            makesProducts: true, prodMats: [],
            materialRatio: [["Hardware", 0], ["AI Cores", 0], ["Real Estate", 0], ["Robots", .25]], //from chart
            reFac: 0.15, sciFac: 0.75, hwFac: 0.15, robFac: 0.2, aiFac: 0.15, advFac: 0.2,
            reqMats: { "Plants": 1, "Water": 0.2 }, incFac: 9, upFac: 5
        },
        {
            name: "Chemical",
            makesProducts: false, prodMats: ["Chemicals"],
            materialRatio: [["Hardware", .25], ["AI Cores", .25], ["Real Estate", .25], ["Robots", .25]], // from chart
            reFac: 0.25, sciFac: 0.75, hwFac: 0.2, robFac: 0.25, aiFac: 0.2, advFac: 0.07,
            reqMats: { "Plants": 1, "Energy": 0.5, "Water": 0.5 }, incFac: 9, upFac: 5
        },
        {
            name: "Pharmaceutical",
            makesProducts: true, prodMats: ["Drugs"],
            materialRatio: [["Hardware", .25], ["AI Cores", .25], ["Real Estate", .25], ["Robots", .25]], //verified
            reFac: 0.05, sciFac: 0.8, hwFac: 0.15, robFac: 0.25, aiFac: 0.2, advFac: 0.16,
            reqMats: { "Water": 0.5, "Energy": 1, "Chemicals": 2 }, incFac: 9, upFac: 5
        },
        {
            name: "Computer",
            makesProducts: true, prodMats: ["Hardware"],
            materialRatio: [["Hardware", 0], ["AI Cores", .15], ["Real Estate", .20], ["Robots", .30]],
            reFac: 0.2, sciFac: 0.62, hwFac: 0, robFac: 0.36, aiFac: 0.19, advFac: 0.17,
            reqMats: { "Energy": 1, "Metal": 2 }, incFac: 9, upFac: 5
        },
        {
            name: "Robotics",
            makesProducts: true, prodMats: ["Robots"],
            materialRatio: [["Hardware", 0], ["AI Cores", .30], ["Real Estate", .25], ["Robots", 0]],
            reFac: 0.32, sciFac: 0.65, hwFac: 0.19, robFac: 0, aiFac: 0.36, advFac: 0.18,
            reqMats: { "Hardware": 5, "Energy": 3 }, incFac: 9, upFac: 5
        },
        {
            name: "Software",
            makesProducts: true, prodMats: ["AI Cores"],
            materialRatio: [["Hardware", 0], ["AI Cores", 0], ["Real Estate", .1], ["Robots", .15]],
            reFac: 0.15, sciFac: 0.62, hwFac: 0.25, robFac: 0.05, aiFac: 0.18, advFac: 0.16,
            reqMats: { "Hardware": 0.5, "Energy": 0.5 }, incFac: 9, upFac: 5
        },
        {
            name: "Healthcare",
            makesProducts: true, prodMats: [],
            materialRatio: [["Hardware", .25], ["AI Cores", 0], ["Real Estate", .25], ["Robots", 0]],
            reFac: 0.1, sciFac: 0.75, hwFac: 0.1, robFac: 0.1, aiFac: 0.1, advFac: 0.11,
            reqMats: { "Robots": 10, "AICores": 5, "Energy": 5, "Water": 5 }, incFac: 9, upFac: 5
        },
        {
            name: "Real Estate",
            makesProducts: true, prodMats: ["Real Estate"],
            materialRatio: [["Hardware", 0], ["AI Cores", .25], ["Real Estate", 0], ["Robots", .25]],
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
        "Real Estate": 0.005,
    }

    let jobStats = [
        { name: "Engineer", "1": 0.2, "2": 0.2, "3": 0.2, primeStat: "exp" },
        { name: "Research & Development", "1": 0.1, "2": 0.2, "3": 0.2, primeStat: "int" },
        { name: "Operations", "1": 0.5, "2": 0.5, "3": 0.5, primeStat: "eff" },
        { name: "Management", "1": 0.1, "2": 0.05, "3": 0.05, primeStat: "cha" },//management has cha priority in ordering
        { name: "Business", "1": 0.1, "2": 0.05, "3": 0.05, primeStat: "cha" },
        { name: "Training", "1": 0, "2": 0, "3": 0, primeStat: "" }
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
        upgradeScale = logBase(phase + 10, industryDB.find(d => d.name == division.type).incFac);
        // ns.print(`upgradeScale: ${upgradeScale}`);
        incomeThreshold = Math.pow(1.5e6, upgradeScale);
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
    getNoffer()
    get an investment offer and accept based on the round number
    */


    function getNoffer(ns) {

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
    /*
    purchaseUpgrade()
    purchase corp1 unlockable upgrades based on a predfined order list.
    

    function purchaseUnlock(ns, corpUpgrade) {
        ns.print(`Checking for funds to purchase unlocks...`);
        updateBaseData(ns);; //refresh corp1 stats
        if (corp.hasUnlockUpgrade(corpUpgrade) && corp.getUnlockUpgradeCost(corpUpgrade) <= corp1.funds) {
            ns.print(`Purchasing unlocks...`);
            corp.unlockUpgrade(corpUpgrade);
            ns.print(`SUCCESS`);
            return;
        } else if (!corp.hasUnlockUpgrade(corpUpgrade) && corp.getUnlockUpgradeCost(corpUpgrade) > corp1.funds) {
            ns.print("FAILED: Insufficient funds to buy ", corpUpgrade);
        } else ns.print(`SUCCESS: ${corpUpgrade} already owned`);
    }
*/
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////



    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function advertise(ns, div, force) {
        updateBaseData(ns);

        if (force) {
            corp.hireAdVert(div);
            ns.print(`Purchasing Advertisements .....`)
        }

        if (corp.getHireAdVertCost(div) < corp1.funds * upgradeSpeed) {
            corp.hireAdVert(div);
            ns.print(`SUCCESS: advertising level increased...`)
        } else ns.print(`FAILED: Insufficient funds to hire AdVert`);


    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////


    async function corpUpgrader(ns, force) {
        updateBaseData(ns);
        ns.print(`CORP-UPGRADER: Checking for levelable upgrade...`);
        for (let upgrade of corpUpgrades) {

            if (force && corp.getUpgradeLevelCost(upgrade) < corp1.funds * upgradeSpeed) {
                await corp.levelUpgrade(upgrade);
                ns.print(`SUCCESS: ${upgrade} level increased by 1.`)

            } else ns.print(`FAILED: Insufficient funds to Upgrade ${upgrade}`);

            updateBaseData(ns);
        };
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////


    async function officeUpgrader(ns, divname, cityName, force) {
        updateBaseData(ns);
        ns.print(`${cityName}: Checking for office upgrades...`);

        let thisOffice = corp.getOffice(divname, cityName);
        let upgradeSize = 10;

        if (force && corp.getOfficeSizeUpgradeCost(divname, cityName, 10) < corp1.funds * upgradeSpeed) {
            await corp.upgradeOfficeSize(divname, cityName, upgradeSize);
        }
        ns.print(`upgradeSpeed: ${upgradeSpeed}`);
        let cost = corp.getOfficeSizeUpgradeCost(divname, cityName, upgradeSize)
        if (cost < (corp1.funds * upgradeSpeed) && employeeMeta.avgEne > 99.99 && employeeMeta.avgHap > 99.99) {
            ns.print(`${cityName}: Office upgrades available. Happiness and Energy recovered`);
            await corp.upgradeOfficeSize(divname, cityName, upgradeSize);
            ns.print(`SUCCESS: ${cityName}: added ${upgradeSize} cubicles to office `);
            await ns.sleep(1007);
        } else ns.print(`FAILED: ${cityName}: Insufficient Funds. cost ${cost.toFixed(2)} greater than ${(corp1.funds * upgradeSpeed).toFixed(2)}`)


    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    fillOffice(division name, city name)
    fill all open positions in the specified office, then iterate through a 3d array to auto assign employees to positions, determined by phase
    */
    async function fillOffice(ns, divname, cityName) {
        updateBaseData(ns);
        //ns.print(`${cityName}: Hiring employees to fill the office...`);
        let thisOffice = corp.getOffice(divname, cityName);
        let i = thisOffice.employees.length;
        let newhires = thisOffice.size - i;
        ns.print(`INFO: ${cityName}: Current employees: ${i}, of ${thisOffice.size}. ${newhires}  newhires needed`);


        while (i < thisOffice.size) {
            await corp.hireEmployee(divname, cityName);
            i++;
            ns.print(`SUCCESS: ${cityName}: hired employee ${i} of ${thisOffice.size}`);
            await ns.sleep(100);
        }

        await hrDept(ns, divname, cityName, false); //assign people to the correct jobs
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    whUpgrader(division name, city name)
    increase the size of the warehouse, based on phase, 
    */

    async function whUpgrader(ns, divname, cityName) {
        updateBaseData(ns);

        if (!corp.hasWarehouse(divname, cityName)) {
            ns.print(`${cityName}: No warehouse found. creating one`)
            if (corp.getPurchaseWarehouseCost() < corp1.funds) {
                await corp.purchaseWarehouse(divname, cityName);
                ns.print(`SUCCESS: ${cityName}: warehouse created `);

            } else {
                ns.print(`FAILED: Insufficient funds to Purchase Warehouse in ${cityName}`);
                return;
            }
        } //else ns.print(`SUCCESS: ${cityName} warehouse exists`)

        updateEmpMeta(ns, divname, cityName);


        ns.print(`INFO: ${cityName} - Warehouse is ${wh_size} units @ ${wh_percent_used}% utilized `)



        while (wh_percent_used > 95) { // if the wh is too small based on utilization of 
            //ns.print(`${cityName}: Warehouse updgrade needed.`)
            //ns.print(corp.getUpgradeWarehouseCost(divname, cityName)) 

            // UPGRADE the warehouse
            if (corp.getUpgradeWarehouseCost(divname, cityName) < corp1.funds * upgradeSpeed * 3) {
                await corp.upgradeWarehouse(divname, cityName);
                ns.print(`${cityName}: Warehouse upgraded. `)

                // reload wh stats before looping, ITERATOR
                updateEmpMeta(ns, divname, cityName);
                ns.print(`${cityName} - Warehouse is  ${wh_percent_used}%utilized `)
                //ns.print(`${cityName} - Warehouse is ${wh_size}, ${wh_percent_used}%utilized `)
                // await ns.sleep(1006);
            } else break;

            await ns.sleep(1015);
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    async function purchaseMaterials(ns, divname, cityName) {
        //ns.print(`${cityName}: Getting materials...`)
        updateBaseData(ns);

        if (wh_size > 10000) {
            ns.print(`INFO: WH Stock no longer needs management.`);
            return;
        }
        for (let material of materials) {

            updateEmpMeta(ns, divname, cityName);

            let purchase_timing_interval = 10000;
            //corp.hasResearched(divname,"Bulk Purchasing") ? purchase_timing_interval = purchase_timing_interval/10 : purchase_timing_interval;
            let amt_proportion = 1 / (purchase_timing_interval / (purchase_timing_interval / bonusTime))

            // how many units of this material in the warehouse
            let currentstock = (corp.getMaterial(divname, cityName, material[0]).qty);
            let factor = 1
            wh_size > 6000 ? factor = upgradeSpeed : factor = 1;

            // what is our target stock volume. (half the warehouse space * the percent of availble space for that material divided by the material size)
            let desiredStock = (((wh_size / 2) * material[1]) / materialSizes[material[0]]) * Math.pow(factor, factor);

            // how much we need to change stock by
            let amt = desiredStock - currentstock;

            let loopcount = 0;
            while (currentstock > desiredStock * 1.1 || currentstock < desiredStock * 0.9) {
                loopcount += 1;
                loopcount % 3 == 0 ? bonusTime = 100 : bonusTime = 10;
                if (loopcount > 5) {
                    await corp.sellMaterial(divname, cityName, material[0], "", "");
                    await corp.buyMaterial(divname, cityName, material[0], 0);

                }
                amt = desiredStock - currentstock;

                amt_proportion = 1 / (purchase_timing_interval / (purchase_timing_interval / bonusTime))
                let perSecAmt = amt * amt_proportion;
                if (amt == 0 || desiredStock == 0) {
                    //if (wh_percent_used == 100) break;
                    ns.print(`INFO: ${cityName}:  ${material[0]} stock optimized. no changes needed `)
                    await ns.sleep(purchase_timing_interval / 10)
                    break;

                } else if (amt > 0 && desiredStock !== 0) {
                    ns.print(`INFO: ${cityName}: Not enough ${material[0]}, purchasing ${(amt * amt_proportion).toFixed(2)}/sec until we have ${desiredStock.toFixed(2)} - %${((currentstock / desiredStock) * 100).toFixed(1)}.`);

                    await corp.buyMaterial(divname, cityName, material[0], (perSecAmt));
                    await ns.sleep(purchase_timing_interval);
                    await corp.buyMaterial(divname, cityName, material[0], 0) //reset to 0 after buy cycle
                    currentstock = corp.getMaterial(divname, cityName, material[0]).qty


                } else if (amt < 0 && currentstock > 0) {

                    ns.print(`INFO: ${cityName}: Too many units of ${material[0]} in stock. selling ${-amt.toFixed(2)} - %${((currentstock / desiredStock) * 100).toFixed(1)}`)

                    await corp.sellMaterial(divname, cityName, material[0], -perSecAmt, "0");
                    await ns.sleep(purchase_timing_interval);
                    await corp.sellMaterial(divname, cityName, material[0], "", "")
                    currentstock = corp.getMaterial(divname, cityName, material[0]).qty
                    //if (wh_percent_used == 100) break;


                } else {
                    ns.print(`FAILURE: ${cityName}:  ${material[0]} INFINITE LOOP CATCHER `)
                    await ns.sleep(purchase_timing_interval / 10);
                }

                currentstock = (corp.getMaterial(divname, cityName, material[0]).qty);
                desiredStock = (((wh_size / 2) * material[1]) / materialSizes[material[0]]);
                //amt = desiredStock - currentstock;
                updateBaseData(ns);
                updateEmpMeta(ns, divname, cityName);
                //ns.print(`${cityName}: Currentstock: ${currentstock} - DesiredStock: ${desiredStock} - amt: ${amt}`)
                //await ns.sleep(purchase_timing_interval / 10);
            }
            ns.print(`INFO: ${cityName}: Material: ${material[0]} Currentstock: ${currentstock.toFixed(2)} - DesiredStock: ${desiredStock.toFixed(2)} - amt: ${amt.toFixed(2)}`)


        };

    }


    ///////////////////////////////////////////////////////////////////////////////////////////
    /*
        async function productMaker(ns, div, cityName) {
            let currentDiv = divisionInfo.filter(d => { d.name ==div });
                    
            for (let productName of currentDiv.products){
                
            corp.makeProduct(divisionName, cityName, productName, 1e9, 1e9);
            }
        }
    */
    ///////////////////////////////////////////////////////////////////////////////////////////



    async function hrDept(ns, div, cityName, shuffle) {


        // load all of the employee objects into an array
        updateEmpMeta(ns, div, cityName);

        if (shuffle) {
            for (let employee of employeeDB) {
                await corp.assignJob(div, cityName, employee.name, "Unassigned")
                ns.print(`INFO: ${cityName} Unassigned to be reassigned a new job.`)
                await ns.sleep(1010);
            }
        }

        // look for the best cadidates for each job
        for (let job of jobStats) { // change order of jobstats array to prioritize one job over another.
            let employeeTemp = employeeDB.sort(dynamicSort(job.primeStat))//.slice(0, -(employeeDB.length - job[phase]));


            //employeeMeta[job.name];
            //ns.print(`${cityName}: Initial count for ${job.name} is ${employeeMeta[job.name]}`)
            let tempphase = 0;
            phase > 3 ? tempphase = 3 : tempphase = phase;
            let jobTarget = Math.round(job[tempphase] * employeeMeta.Total);
            if (employeeMeta[job.name] >= jobTarget) {
                //ns.print(`${cityName}: ${job.name} employees already hired (${employeeMeta[job.name]} of ${jobTarget})....`);
                //continue;
            } //else ns.print(`${cityName}: Not enough employees assigned to ${job.name}`);



            for (let employee of employeeTemp) {
                //ns.print(`${employee.pos}`)
                if (employee.pos == "Unassigned" && employeeMeta[job.name] < jobTarget) {


                    await corp.assignJob(div, cityName, employee.name, job.name)
                    ns.print(`SUCCESS, ${cityName}: ${employeeMeta[job.name]} of ${jobTarget}`);
                    ns.print(`${cityName}: Assigning Name: ${employee.name} - ${job.primeStat} = ${employee[job.primeStat]} to ${job.name}`);
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
                ns.print(`INFO: ${science} already complete.`)
            }
            let researchCost = corp.getResearchCost(divname, science);
            if (currentResearchAmt - researchCost > 10000 && !corp.hasResearched(divname, science)) {
                corp.research(divname, science);
                ns.print(`SUCCESS: Research completed: ${science}`);
            } else if (!corp.hasResearched(divname, science)) {

                ns.print(`INFO: Research still pending: ${science}`);
            }
        }




    }
    /////////////////////////////////////////////////////////////////////////////////////////////


    async function productManager(ns, divisionName, cityName) {
        updateBaseData(ns);
        let productName = divisionName.concat("-", Math.ceil((Math.random() + Math.random()) * 10));
        let designInvest = 1e9;
        let marketingInvest = 1e9;
        let products = division.products;
        let hasTA2 = corp.hasResearched(division.name, "Market-TA.II");
        let prodMeta = [];
        let choppingBlock = []

        while (products.includes(productName)) {
            productName = divisionName.concat("-", Math.ceil((Math.random() + Math.random()) * 10))
        }
        if (makesProds) {

            for (let p of products) {
                let temp = corp.getProduct(divisionName, p)
                if (temp.developmentProgress > 100) prodMeta.push(temp);
            }
            prodMeta.length !== 0 ? choppingBlock = prodMeta.sort(dynamicSort("dmd")) : choppingBlock;

            if (products.length <= 3) {
                corp.makeProduct(divisionName, cityName, productName, designInvest, marketingInvest);
                ns.print(`SUCCESS: Product ${productName} created. `);

            } else if (prodMeta.length >= 4) {
                corp.discontinueProduct(divisionName, choppingBlock[choppingBlock.length - 1].name)
                ns.print(`SUCCESS: Product ${choppingBlock[choppingBlock.length - 1].name} DISCONTINUED`);
            }

            if (prodMeta.length >= 1 && prodMeta.length <= 3) {
                for (let product of prodMeta) {
                    ns.print(`INFO: Product ${product.name} loaded. `);

                    if (hasTA2) {
                        // corp.setProductMarketTA1(divisionName, product.name, true)
                        //  corp.setProductMarketTA2(divisionName, product.name, true);
                        // ns.print(`SUCCESS: Market-TA.II set for ${product.name} in ${cityName}`);
                        corp.sellProduct(divisionName, cityName, product.name, "MAX", "MP", true)
                        ns.print(`SUCCESS: ${product.name} set to be sold in ${cityName}`);
                    } else {
                        corp.sellProduct(divisionName, cityName, product.name, "MAX", "MP", true)
                        ns.print(`SUCCESS: ${product.name} set to be sold in ${cityName}`);
                    }

                }
            }
        }

        let prodmats = industryDB.find(d => d.name == division.type).prodMats;
        if (prodmats.length >= 1) {
            for (let mat of prodmats) {
                updateBaseData(ns);

                if (hasTA2) {
                    // await corp.setMaterialMarketTA2(division.name, cityName, mat, true);
                    //await corp.setMaterialMarketTA1(division.name, cityName, mat, true);
                    // ns.print(`SUCCESS: Market-TA.II set for ${mat} in ${cityName}`);

                    await corp.sellMaterial(division.name, cityName, mat, "MAX", "MP");
                    ns.print(`SUCCESS: ${mat} set to be sold in ${cityName}`);

                } else if (mat.length >= 1) {

                    await corp.sellMaterial(division.name, cityName, mat, "MAX", "MP");
                    ns.print(`SUCCESS: ${mat} set to be sold in ${cityName}`);
                }
            }

        }


    }



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
                updateBaseData(ns);
                await whUpgrader(ns, division.name, cityName);
                // if smartsupply is not enabled, enable it
                if (!warehouse.smartSupplyEnabled) {
                    updateBaseData(ns);
                    await corp.setSmartSupply(division.name, cityName, true);
                    ns.print("Smart Supply enabled for ", cityName);
                }

            } else ns.print(`uknown error in warehouse creation`)

            await purchaseMaterials(ns, division.name, cityName);
            await productManager(ns, division.name, cityName);
            await ns.sleep(1005);
            updateBaseData(ns);
            // increase the size of the office up to the phase limit
            await officeUpgrader(ns, division.name, cityName, false)
            updateBaseData(ns);
            //hire the first round of emplyees which calls to hrdept to assign jobs.
            await fillOffice(ns, division.name, cityName);
            updateBaseData(ns);
            await hrDept(ns, division.name, cityName, false); //assign people to the correct jobs
            //await purchaseMaterials(ns, division.name, cityName);

        }


    }


    /// MAINTENANCE LOOP

    while (true) {
        maintLoopCounter += 1;
        ns.print(`BEGIN MAINTENANCE LOOP ---------PHASE ${phase} - LOOP ${maintLoopCounter}----------`)
        updateBaseData(ns);
        let bigMeta = [];


        profit = (corp1.revenue - corp1.expenses);
        ns.print(`PROFIT CHECK -------------- ${profit}:${incomeThreshold}`)


        updateBaseData(ns);
        //profit = (corp1.revenue - corp1.expenses);


        if (corp.getHireAdVertCost(division.name) < corp1.funds * upgradeSpeed) {
            await advertise(ns, division.name, true)
        }

        await corpUpgrader(ns, true);
        await headResearcher(ns, division.name);

        await ns.sleep(100001);
        updateBaseData(ns);

        for (let cityName of cities) {
            updateEmpMeta(ns, division.name, cityName);
            bigMeta.push(updateEmpMeta(ns, division.name, cityName));



            // if (wh_percent_used > 80) {
            await whUpgrader(ns, division.name, cityName);
            //await ns.sleep(1004);



            await purchaseMaterials(ns, division.name, cityName);
            await productManager(ns, division.name, cityName);
            //await ns.sleep(1005);

            //if (employeeMeta.avgEne > 99.9 && employeeMeta.avgHap > 99.9) {


            await officeUpgrader(ns, division.name, cityName, true)
            //await ns.sleep(1021)
            //hire the first round of emplyees
            await fillOffice(ns, division.name, cityName);
            //await ns.sleep(1001);

            updateEmpMeta(ns, division.name, cityName);
            if (maintLoopCounter % 15 == 0) {
                await hrDept(ns, division.name, cityName, true); //assign people to the correct jobs
            }

        }
        updateBaseData(ns);

        if (profit >= incomeThreshold) {
            ns.print(`Waiting on profit threshold of ${incomeThreshold}, currently ${profit} `);
            if (getNoffer(ns)) {
                ns.print(`SUCCESS: Investment offer meets threshold and was accepted.`)
            }
            phase += 1; //advacne to the next phase
            ns.print(`SUCCESS: PHASE ADVANCED TO ${phase}`)
            updateBaseData(ns);
            await ns.sleep(100002)

        }
        updateBaseData(ns);
        await ns.sleep(100001)




        //if (corp1.funds > (2e12 * (phase * 0.1))) phase += 1;

    }
}
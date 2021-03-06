/**  
 * 
 @param {NS} ns */
/* TODO

1. create objects for each division that include their phase settings, products that need to be sold (with settings),
and materials to put in the warehouse. this would replace switched 3d arrays.

*/

const argsSchema = [
    ['phase', 1], // Do nothing but hack, no prepping (drains servers to 0 money, if you want to do that for some reason)
    ['div', "Agriculture"]
];
export function autocomplete(data, args) {
    data.flags(argsSchema);
    return [];
}
export async function main(ns) {

    //let player = ns.getPlayer();

    //let multi = player.bitNodeN === 1 || player.bitNodeN === 3 ? 1 : 0;
    //if (dictSourceFiles[5] > 0) multi = ns.getBitNodeMultipliers().corpValuation;

    /**if (!corp.hasUnlockUpgrade("Warehouse API") && corp.getUnlockUpgradeCost("Warehouse API") > corp1.funds) {
        throw new Error("FAILED: Insufficient funds for Warehouse API, required")
    } else if (!corp.hasUnlockUpgrade("Warehouse API") && corp.getUnlockUpgradeCost("Warehouse API") < corp1.funds) {
        corp.unlockUpgrade("Warehouse API");
    }**/


    let args = ns.flags(argsSchema);
    let phase = args[`phase`]; // args[0];
    let div = args[`div`];
    const rootname = "FUBAR";
    let player = ns.getPlayer();


    const cities = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"];

    const corp = eval("ns.corporation"); ///shhhh

    let industryDB = [
        { name: "Energy", makesProducts: false, prodMats: ["Energy"], reFac: 0.65, sciFac: 0.7, hwFac: 0, robFac: 0.05, aiFac: 0.3, advFac: 0.08, reqMats: { "Hardware": 0.1, "Metal": 0.2 } },
        { name: "Utilities", makesProducts: false, prodMats: ["Water"], reFac: 0.5, sciFac: 0.6, hwFac: 0, robFac: 0.4, aiFac: 0.4, advFac: 0.08, reqMats: { "Hardware": 0.1, "Metal": 0.1 } },
        { name: "Agriculture", makesProducts: false, prodMats: ["Plants", "Food"], reFac: 0.72, sciFac: 0.5, hwFac: 0.2, robFac: 0.3, aiFac: 0.3, advFac: 0.04, reqMats: { "Water": 0.5, "Energy": 0.5 } },
        { name: "Fishing", makesProducts: false, prodMats: ["Food"], reFac: 0.15, sciFac: 0.35, hwFac: 0.35, robFac: 0.5, aiFac: 0.2, advFac: 0.08, reqMats: { "Energy": 0.5 } },
        { name: "Mining", makesProducts: false, prodMats: ["Metal"], reFac: 0.3, sciFac: 0.26, hwFac: 0.4, robFac: 0.45, aiFac: 0.45, advFac: 0.06, reqMats: { "Energy": 0.8 } },
        { name: "Food", makesProducts: true, prodMats: [""], reFac: 0.05, sciFac: 0.12, hwFac: 0.15, robFac: 0.3, aiFac: 0.25, advFac: 0.25, reqMats: { "Food": 0.5, "Water": 0.5, "Energy": 0.2 } },
        { name: "Tobacco", makesProducts: true, prodMats: [""], reFac: 0.15, sciFac: 0.75, hwFac: 0.15, robFac: 0.2, aiFac: 0.15, advFac: 0.2, reqMats: { "Plants": 1, "Water": 0.2 } },
        { name: "Chemical", makesProducts: false, prodMats: ["Chemicals"], reFac: 0.25, sciFac: 0.75, hwFac: 0.2, robFac: 0.25, aiFac: 0.2, advFac: 0.07, reqMats: { "Plants": 1, "Energy": 0.5, "Water": 0.5 } },
        { name: "Pharmaceutical", makesProducts: true, prodMats: [""], reFac: 0.05, sciFac: 0.8, hwFac: 0.15, robFac: 0.25, aiFac: 0.2, advFac: 0.16, reqMats: { "Water": 0.5, "Energy": 1, "Chemicals": 2 } },
        { name: "Computer", makesProducts: true, prodMats: ["Harware"], reFac: 0.2, sciFac: 0.62, hwFac: 0, robFac: 0.36, aiFac: 0.19, advFac: 0.17, reqMats: { "Energy": 1, "Metal": 2 } },
        { name: "Robotics", makesProducts: true, prodMats: ["Robots"], reFac: 0.32, sciFac: 0.65, hwFac: 0.19, robFac: 0, aiFac: 0.36, advFac: 0.18, reqMats: { "Hardware": 5, "Energy": 3 } },
        { name: "Software", makesProducts: true, prodMats: ["AICores"], reFac: 0.15, sciFac: 0.62, hwFac: 0.25, robFac: 0.05, aiFac: 0.18, advFac: 0.16, reqMats: { "Hardware": 0.5, "Energy": 0.5 } },
        { name: "Healthcare", makesProducts: true, prodMats: [""], reFac: 0.1, sciFac: 0.75, hwFac: 0.1, robFac: 0.1, aiFac: 0.1, advFac: 0.11, reqMats: { "Robots": 10, "AICores": 5, "Energy": 5, "Water": 5 } },
        { name: "RealEstate", makesProducts: true, prodMats: ["RealEstate"], reFac: 0, sciFac: 0.05, hwFac: 0.05, robFac: 0.6, aiFac: 0.6, advFac: 0.25, reqMats: { "Metal": 5, "Energy": 5, "Water": 2, "Hardware": 4 } },
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

    const testDB =
    {
        "1": {

            "incomeThreshold": 1.5e6,
            "targetOfficeSize": 3,
            "targetWHSize": 300,
            "advertTarget": 2,
            "jobs": [["Research & Development", 0], ["Business", 0.33], ["Engineer", 0.33], ["Management", 0], ["Operations", 0.33], ["Training", 0]],
            "materials": [["Hardware", .1], ["AI Cores", .2], ["Real Estate", .7], ["Robots", 0]],
            "corpUpgrades": [["FocusWires", 2], ["Neural Accelerators", 2], ["Speech Processor Implants", 2], ["Nuoptimal Nootropic Injector Implants", 2],
            ["Smart Storage", 0], ["Smart Factories", 2], ["Wilson Analytics", 0], ["Project Insight", 0], ["DreamSense", 0], ["ABC SalesBots", 0]],
            "corpUnlockables": ["Smart Supply"]
        },

        "2": {

            "incomeThreshold": 5e6,
            "targetOfficeSize": 10,
            "targetWHSize": 2000,
            "advertTarget": 3,
            "jobs": [["Research & Development", 0.2], ["Business", 0.05], ["Engineer", 0.2], ["Management", 0.05], ["Operations", 0.5], ["Training", 0]],
            "materials": [["Hardware", .1], ["AI Cores", .1], ["Real Estate", .7], ["Robots", .1]],
            "corpUpgrades": [["FocusWires", 2], ["Neural Accelerators", 2], ["Speech Processor Implants", 2], ["Nuoptimal Nootropic Injector Implants", 2],
            ["Smart Storage", 10], ["Smart Factories", 10], ["Wilson Analytics", 0], ["Project Insight", 0], ["DreamSense", 0], ["ABC SalesBots", 0]],
            "corpUnlockables": ["Smart Supply"]
        },
        "3": {

            "incomeThreshold": 5e7, //50,000,000
            "targetOfficeSize": 20,
            "targetWHSize": 3800,
            "advertTarget": 4,
            "jobs": [["Research & Development", 0.2], ["Business", 0.05], ["Engineer", 0.2], ["Management", 0.05], ["Operations", 0.5], ["Training", 0]],
            "materials": [["Hardware", .1], ["AI Cores", .1], ["Real Estate", .7], ["Robots", .1]],
            "corpUpgrades": [["Wilson Analytics", 0], ["FocusWires", 4], ["Neural Accelerators", 4], ["Speech Processor Implants", 4], ["Nuoptimal Nootropic Injector Implants", 4],
            ["Smart Storage", 10], ["Smart Factories", 10], ["Project Insight", 0], ["DreamSense", 0], ["ABC SalesBots", 0]],
            "corpUnlockables": ["Smart Supply"]
        },
    }


    let employeeMeta = {
        "Total": 0,
        "Research & Development": 0,
        "Business": 0,
        "Engineer": 0,
        "Management": 0,
        "Operations": 0,
        "Training": 0
    };

    let generalMeta = {
        "warehouseUtilization": 0,

    }

    let advertTarget = testDB[phase].advertTarget;
    let targetOfficeSize = testDB[phase].targetOfficeSize;
    let jobs = testDB[phase].jobs;
    let materials = testDB[phase].materials;
    let corpUpgrades = testDB[phase].corpUpgrades;
    let corpUnlockables = testDB[phase].corpUnlockables;
    let incomeThreshold = testDB[phase].incomeThreshold;
    let wh_size = 0;
    let wh_size_used = 0; //get the amt of the wh currently used
    let wh_percent_used = 0;
    let targetWHSize = testDB[phase].targetWHSize;
    let upgradeScale = 1e4; // 10000
    let profit = 0;
    let upgradeSpeed = 0.07;


    async function updateBaseData(ns) {
        //ns.print(`Rechecking settings...`);
        advertTarget = testDB[phase].advertTarget;
        //ns.print(`Rechecking settings...1`);
        targetOfficeSize = testDB[phase].targetOfficeSize;
        //ns.print(`Rechecking settings...2`);
        jobs = testDB[phase].jobs;
        //ns.print(`Rechecking settings...3`);
        materials = testDB[phase].materials;
        //ns.print(`Rechecking settings...4`);
        corpUpgrades = testDB[phase].corpUpgrades;
        //ns.print(`Rechecking settings...5`);
        corpUnlockables = testDB[phase].corpUnlockables;
        //ns.print(`Rechecking settings...6`);
        incomeThreshold = testDB[phase].incomeThreshold;
        //ns.print(`Rechecking settings...7`);
        targetWHSize = testDB[phase].targetWHSize;
        //ns.print(`Rechecking settings...8`);


        //ns.print(`Resetting corp/div objects....9`);
        corp1 = corp.getCorporation();
        profit = (corp1.revenue - corp1.expenses);
        player = corp.getPlayer();
        division = corp.getDivision(div);

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



        if (corp.getHireAdVertCount(div) < advertTarget) {
            ns.print(`Checking for advertising level....`)
            if (corp.getHireAdVertCost(div) < corp1.funds) {
                corp.hireAdVert(div);
                ns.print(`SUCCESS: advertising level increased...`)
            } else ns.print(`FAILED: Insufficient funds to hire AdVert`);
            return;
        } else if (phase >= 3 && corp1.funds > upgradeScale * profit) {
            corp.hireAdVert(div);

        } else ns.print(`SUCCESS: Advertising level achieved....`);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////


    async function corpUpgrader(ns, force) {
        updateBaseData(ns);
        ns.print(`CORP-UPGRADER: Checking for levelable upgrade...`);
        for (let upgrade of corpUpgrades) {
            let i = 0;

            if (force && corp.getUpgradeLevelCost(upgrade[0]) < corp1.funds * upgradeSpeed) {
                await corp.levelUpgrade(upgrade[0]);
                ns.print(`SUCCESS: ${upgrade[0]} level FORCE increased.`)

            }

            if (corp.getUpgradeLevel(upgrade[0]) < upgrade[1]) {
                if (corp.getUpgradeLevelCost(upgrade[0]) <= corp1.funds) {
                    //ns.print(`Levels available, upgrading...`);
                    while (i < upgrade[1]) {
                        //ns.print(`Upgrading ${upgrade[0]} to level ${i} of ${upgrade[1]}`);
                        await corp.levelUpgrade(upgrade[0]);
                        ns.print(`SUCCESS: ${upgrade[0]} level increased.`)
                        i++;
                        await ns.sleep(201);
                    }
                } else if (phase == 3 && corp1.funds > (corp1.revenue - corp1.expenses) * upgradeScale) {
                    await corp.levelUpgrade(upgrade[0]);
                    ns.print(`SUCCESS: CORP-UPGRADER: ${upgrade[0]} level increased.`)
                } else if (corp.getUpgradeLevelCost(upgrade[0]) > corp1.funds) {
                    ns.print(`FAILED: CORP-UPGRADER: Insufficient funds to Upgrade ${upgrade[0]} to level ${i}`);
                };

            }
            updateBaseData(ns);
        };
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////


    async function officeUpgrader(ns, divname, cityName, force) {
        updateBaseData(ns);
        ns.print(`${cityName}: Checking for office upgrades...`);

        let thisOffice = corp.getOffice(divname, cityName);
        let upgradeSize = targetOfficeSize - thisOffice.size;
        //ns.print(`FAILED: ${cityName}:  upgradeSize ${upgradeSize}`)

        if (force && corp.getOfficeSizeUpgradeCost(divname, cityName, 10) < corp1.funds * upgradeSpeed) {
            await corp.upgradeOfficeSize(divname, cityName, 10);
        }

        //after phase 3 if the upgrade is not a multiple of 10, make it one.
        phase > 3 && upgradeSize % 10 !== 0 ? upgradeSize = (upgradeSize % 10) + upgradeSize : upgradeSize = targetOfficeSize - thisOffice.size;

        if (upgradeSize > 0) {
            ns.print(`${cityName}: office upgrades NEEDED`);
            if (corp.getOfficeSizeUpgradeCost(divname, cityName, upgradeSize) < corp1.funds) {
                //ns.print(`Office upgrades available....`);
                await corp.upgradeOfficeSize(divname, cityName, upgradeSize);
                ns.print(`SUCCESS: ${cityName}: added ${upgradeSize} to office `);
                await ns.sleep(1007);
            } else ns.print(`FAILED: ${cityName}: Insufficient Funds.`)

        } else if (phase >= 3 && corp1.funds > (profit * upgradeScale)) {
            //ns.print(`Office upgrades available....`);
            await corp.upgradeOfficeSize(divname, cityName, 2);
            ns.print(`SUCCESS: ${cityName}: added 2 to office in ${cityName}`);
            await ns.sleep(1007);

        } else if (phase >= 3 && employeeMeta.avgEne > 99.9 && employeeMeta.avgHap > 99.9) {
            await corp.upgradeOfficeSize(divname, cityName, 5);
            ns.print(`SUCCESS: ${cityName}: added 5 to office in ${cityName}`);
            await ns.sleep(1007);

        } else if (thisOffice.size >= targetOfficeSize) {
            ns.print(`SUCCESS: ${cityName}: No office upgrades required`)

        }

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
            await ns.sleep(1011);
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
        } else ns.print(`SUCCESS: ${cityName} warehouse exists`)

        updateEmpMeta(ns, divname, cityName);


        ns.print(`INFO: ${cityName} - Warehouse is ${wh_size} of ${targetWHSize}, ${wh_percent_used}%utilized `)



        while (wh_size < targetWHSize || wh_percent_used > 99) { // if the wh is too small based on utilization of 
            //ns.print(`${cityName}: Warehouse updgrade needed.`)
            //ns.print(corp.getUpgradeWarehouseCost(divname, cityName)) 

            // UPGRADE the warehouse
            if (corp.getUpgradeWarehouseCost(divname, cityName) < corp1.funds) {
                await corp.upgradeWarehouse(divname, cityName);
                ns.print(`${cityName}: Warehouse upgraded. `)

                // reload wh stats before looping, ITERATOR
                updateEmpMeta(ns, divname, cityName);
                ns.print(`${cityName} - Warehouse is ${wh_size} of ${targetWHSize}, ${wh_percent_used}%utilized `)
                //ns.print(`${cityName} - Warehouse is ${wh_size} of ${targetWHSize}, ${wh_percent_used}%utilized `)
                // await ns.sleep(1006);
            } else break;

            await ns.sleep(1015);
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    async function purchaseMaterials(ns, divname, cityName) {
        //ns.print(`${cityName}: Getting materials...`)
        updateBaseData(ns);
        for (let material of materials) {

            updateEmpMeta(ns, divname, cityName);
            let bonusTime = 10 // 10 for normal timing, but if you are in bonus time this is 100. no API method to indicate bonus time outside gang API

            let timing_interval = 10000;
            let amt_proportion = 1 / (timing_interval / (timing_interval / bonusTime))

            // how many units of this material in the warehouse
            let currentstock = Math.floor(corp.getMaterial(divname, cityName, material[0]).qty);

            // what is our target stock volume. (half the warehouse space * the percent of availble space for that material divided by the material size)
            let desiredStock = Math.floor(((wh_size / 2) * material[1]) / materialSizes[material[0]]);

            // how much we need to change stock by
            let amt = desiredStock - currentstock;
            //ns.print(`START amt: ${amt} - whpercentused: ${wh_percent_used} - proportion ${amt_proportion}`)
            //ns.print(`${cityName}: Checking ${material[0]}, has ${currentstock} of ${desiredStock}`);
            while (currentstock !== desiredStock) {
                // ns.print(`${cityName} staring buy/sell loop`)
                await corp.sellMaterial(divname, cityName, material[0], "", "");//stop selling material
                await corp.buyMaterial(divname, cityName, material[0], 0) // stop buying material
                amt = desiredStock - currentstock;
                amt_proportion = 1 / (timing_interval / (timing_interval / bonusTime))
                let perSecAmt = amt * amt_proportion;
                //if (perSecAmt < 1) perSecAmt = 1;
                if (amt > 0 && wh_percent_used < 100) {
                    ns.print(`INFO: ${cityName}: Not enough ${material[0]}, purchasing ${Math.round(amt * amt_proportion)}/sec until we have ${desiredStock} - %${((currentstock / desiredStock) * 100).toFixed(1)}.`);

                    await corp.buyMaterial(divname, cityName, material[0], (perSecAmt));
                    await ns.sleep(timing_interval);
                    await corp.buyMaterial(divname, cityName, material[0], 0) //reset to 0 after buy cycle
                    currentstock = corp.getMaterial(divname, cityName, material[0]).qty


                } else if (amt < 0) {

                    ns.print(`INFO: ${cityName}: Too many units of ${material[0]} in stock. selling ${-amt} - %${((currentstock / desiredStock) * 100).toFixed(1)}`)

                    await corp.sellMaterial(divname, cityName, material[0], -perSecAmt, "0");
                    await ns.sleep(timing_interval);
                    await corp.sellMaterial(divname, cityName, material[0], "", "")
                    currentstock = corp.getMaterial(divname, cityName, material[0]).qty
                    if (wh_percent_used == 100) break;

                } else if (amt == 0) {
                    //if (wh_percent_used == 100) break;
                    ns.print(`INFO: ${cityName}:  ${material[0]} stock optimized. no changes needed `)
                    await ns.sleep(timing_interval / 10)
                } else await ns.sleep(timing_interval / 10);


                currentstock = Math.floor(corp.getMaterial(divname, cityName, material[0]).qty);
                desiredStock = Math.floor(((wh_size / 2) * material[1]) / materialSizes[material[0]]);
                //amt = desiredStock - currentstock;
                updateBaseData(ns);
                updateEmpMeta(ns, divname, cityName);
                //ns.print(`${cityName}: Currentstock: ${currentstock} - DesiredStock: ${desiredStock} - amt: ${amt}`)
                //await ns.sleep(timing_interval / 10);
            }
            ns.print(`INFO: ${cityName}: Material: ${material[0]} Currentstock: ${currentstock} - DesiredStock: ${desiredStock} - amt: ${amt}`)


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

    function dynamicSort(property) {
        /*
        Credit to Ege ??zcan in a post on stackoverflow
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

                let prodmats = industryDB.find(d => d.name == division.name).prodMats;

                for (let prod of prodmats) {
                    updateBaseData(ns);
                    await corp.sellMaterial(division.name, cityName, prod, "MAX", "MP");
                    ns.print(`SUCCESS: ${prod} set to be sold in ${cityName}`);
                }

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
            updateBaseData(ns);
            // increase the size of the office up to the phase limit
            await officeUpgrader(ns, division.name, cityName, false)
            updateBaseData(ns);
            //hire the first round of emplyees which calls to hrdept to assign jobs.
            await fillOffice(ns, division.name, cityName);
            updateBaseData(ns);
            await hrDept(ns, division.name, cityName, false); //assign people to the correct jobs
            //await purchaseMaterials(ns, division.name, cityName);
            await advertise(ns, division.name);
            await ns.sleep(1002);
        }
    }


    /// MAINTENANCE LOOP
    let maintLoopCounter = 0
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

        await ns.sleep(100001);
        updateBaseData(ns);

        for (let cityName of cities) {
            updateEmpMeta(ns, div, cityName);
            bigMeta.push(updateEmpMeta(ns, div, cityName));

            // if (wh_percent_used > 80) {
            await whUpgrader(ns, division.name, cityName);
            await ns.sleep(1004);
            // }
            await purchaseMaterials(ns, division.name, cityName);
            await ns.sleep(1005);

            //if (employeeMeta.avgEne > 99.9 && employeeMeta.avgHap > 99.9) {


            await officeUpgrader(ns, division.name, cityName, true)
            await ns.sleep(1021)
            //hire the first round of emplyees
            await fillOffice(ns, division.name, cityName);
            await ns.sleep(1001);

            updateEmpMeta(ns, division.name, cityName);
            if (maintLoopCounter % 5 == 0) {
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
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
        "AICores": 0.1,
        "RealEstate": 0.005,
    }

    let jobStats = [
        { name: "Research & Development", "1": 0, "2": 0, "3": 2, primeStat: "int" },
        { name: "Management", "1": 0, "2": 1, "3": 3, primeStat: "cha" },//management has cha priority in ordering
        { name: "Business", "1": 1, "2": 2, "3": 3, primeStat: "cha" },
        { name: "Engineer", "1": 1, "2": 3, "3": 5, primeStat: "exp" },
        { name: "Operations", "1": 1, "2": 3, "3": 5, primeStat: "eff" },
        { name: "Training", "1": 0, "2": 0, "3": 0, primeStat: "" }
    ]

    const testDB =
    {
        "1": {

            "incomeThreshold": 1.5e6,
            "targetOfficeSize": 3,
            "targetWHSize": 300,
            "advertTarget": 2,
            "jobs": [["Research & Development", 0], ["Business", 1], ["Engineer", 1], ["Management", 0], ["Operations", 1], ["Training", 0]],
            "materials": [["Hardware", .1], ["AI Cores", .2], ["Real Estate", .7], ["Robots", 0]],
            "corpUpgrades": [["FocusWires", 2], ["Neural Accelerators", 2], ["Speech Processor Implants", 2], ["Nuoptimal Nootropic Injector Implants", 2],
            ["Smart Storage", 0], ["Smart Factories", 2], ["Wilson Analytics", 0], ["Project Insight", 0], ["DreamSense", 0], ["ABC SalesBots", 0]],
            "corpUnlockables": ["Smart Supply"]
        },

        "2": {

            "incomeThreshold": 1.5e7,
            "targetOfficeSize": 9,
            "targetWHSize": 2000,
            "advertTarget": 3,
            "jobs": [["Research & Development", 2], ["Business", 1], ["Engineer", 2], ["Management", 1], ["Operations", 3], ["Training", 0]],
            "materials": [["Hardware", .1], ["AI Cores", .1], ["Real Estate", .7], ["Robots", .1]],
            "corpUpgrades": [["FocusWires", 2], ["Neural Accelerators", 2], ["Speech Processor Implants", 2], ["Nuoptimal Nootropic Injector Implants", 2],
            ["Smart Storage", 10], ["Smart Factories", 10], ["Wilson Analytics", 0], ["Project Insight", 0], ["DreamSense", 0], ["ABC SalesBots", 0]],
            "corpUnlockables": ["Smart Supply"]
        },
        "3": {

            "incomeThreshold": 5e7,
            "targetOfficeSize": 18,
            "targetWHSize": 3800,
            "advertTarget": 4,
            "jobs": [["Research & Development", 2], ["Business", 2], ["Engineer", 6], ["Management", 2], ["Operations", 6], ["Training", 0]],
            "materials": [["Hardware", .1], ["AI Cores", .1], ["Real Estate", .7], ["Robots", .1]],
            "corpUpgrades": [["FocusWires", 4], ["Neural Accelerators", 4], ["Speech Processor Implants", 4], ["Nuoptimal Nootropic Injector Implants", 4],
            ["Smart Storage", 10], ["Smart Factories", 10], ["Wilson Analytics", 0], ["Project Insight", 0], ["DreamSense", 0], ["ABC SalesBots", 0]],
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
    let targetWHSize = testDB[phase].targetWHSize;
    let upgradeScale = 1e7;

    async function updateBaseData(ns) {
        ns.print(`Rechecking settings...`);
        advertTarget = testDB[phase].advertTarget;
        targetOfficeSize = testDB[phase].targetOfficeSize;
        jobs = testDB[phase].jobs;
        materials = testDB[phase].materials;
        corpUpgrades = testDB[phase].corpUpgrades;
        corpUnlockables = testDB[phase].corpUnlockables;
        targetWHSize = testDB[phase].targetWHSize;

        ns.print(`Resetting corp/div objects....`);
        corp1 = corp.getCorporation();
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
        ns.print(`Rebuilding Employee Database....`);
        employeeDB = [];
        office.employees.forEach(name => {
            let tempEmployee = corp.getEmployee(divname, cityName, name);
            employeeDB.push(tempEmployee);
        });

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
            sumEne += employee.ene
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
    */

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

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////



    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function advertise(ns, div) {
        updateBaseData(ns);
        ns.print(`Checking for advertising level....`)
        if (corp.getHireAdVertCount(div) < advertTarget) {

            if (corp.getHireAdVertCost(div) < corp1.funds) {
                corp.hireAdVert(div);
                ns.print(`SUCCESS: advertising level increased...`)
            } else ns.print(`FAILED: Insufficient funds to hire AdVert`);
            return;
        } else if (phase == 3 && corp1.funds > upgradeScale * (corp1.revenue - corp1.expenses)) {
            corp.hireAdVert(div);

        } else ns.print(`SUCCESS: Advertising level achieved....`);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////


    async function corpUpgrader(ns) {
        updateBaseData(ns);
        ns.print(`CORP-UPGRADER: Checking for levelable upgrade...`);
        for (let upgrade of corpUpgrades) {
            let i = 0;
            if (corp.getUpgradeLevel(upgrade[0]) < upgrade[1]) {
                if (corp.getUpgradeLevelCost(upgrade[0]) <= corp1.funds) {
                    //ns.print(`Levels available, upgrading...`);
                    while (i < upgrade[1]) {
                        //ns.print(`Upgrading ${upgrade[0]} to level ${i} of ${upgrade[1]}`);
                        await corp.levelUpgrade(upgrade[0]);
                        ns.print(`SUCCESS: ${upgrade[0]} level increased.`)
                        i++;
                        //await ns.sleep(201);
                    }
                } else if (phase == 3 && corp1.funds > (corp1.revenue - corp1.expenses) * upgradeScale) {
                    await corp.levelUpgrade(upgrade[0]);
                    ns.print(`SUCCESS: CORP-UPGRADER: ${upgrade[0]} level increased.`)
                } else if (corp.getUpgradeLevelCost(upgrade[0]) > corp1.funds) {
                    ns.print(`FAILED: CORP-UPGRADER: Insufficient funds to Upgrade ${upgrade[0]} to level ${i}`);
                };
            }
        };
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////


    async function officeUpgrader(ns, divname, cityName) {
        updateBaseData(ns);
        ns.print(`Checking for office upgrades...`);

        let thisOffice = corp.getOffice(divname, cityName);
        let upgradeSize = targetOfficeSize - thisOffice.size;
        ns.print(`FAILED: upgradeSize ${upgradeSize}`)
        if (upgradeSize > 0) {
            ns.print(`office upgrades NEEDED`);
            if (corp.getOfficeSizeUpgradeCost(divname, cityName, upgradeSize) < corp1.funds) {
                //ns.print(`Office upgrades available....`);
                await corp.upgradeOfficeSize(divname, cityName, upgradeSize);
                ns.print(`SUCCESS: added ${upgradeSize} to office in ${cityName}`);
                await ns.sleep(1007);
            } else ns.print(`Insufficient Funds.`)

        } else if (phase == 3 && corp1.funds > ((corp1.revenue - corp1.expenses) * upgradeScale)) {
            //ns.print(`Office upgrades available....`);
            await corp.upgradeOfficeSize(divname, cityName, 2);
            ns.print(`SUCCESS: added 2 to office in ${cityName}`);
            await ns.sleep(1007);

        } else if (thisOffice.size >= targetOfficeSize) {
            ns.print(`SUCCESS: Office already at desired size`)

        }

    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    fillOffice(division name, city name)
    fill all open positions in the specified office, then iterate through a 3d array to auto assign employees to positions, determined by phase
    */
    async function fillOffice(ns, divname, cityName) {
        updateBaseData(ns);
        ns.print(`Hiring employees to fill the office...`);
        let thisOffice = corp.getOffice(divname, cityName);
        let i = thisOffice.employees.length;
        ns.print(`Current employees: ${i}`);
        let newhires = thisOffice.size - thisOffice.employees.length;
        ns.print(`${newhires} newhires needed...`);

        while (i < thisOffice.size) {
            await corp.hireEmployee(divname, cityName);
            i++;
            ns.print("SUCCESS: hired employee in ", cityName);
            await ns.sleep(1011);
        }

        await hrDept(ns, divname, cityName); //assign people to the correct jobs
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    whUpgrader(division name, city name)
    increase the size of the warehouse, based on phase, 
    */

    async function whUpgrader(ns, divname, cityName) {
        updateBaseData(ns);

        if (!corp.hasWarehouse(divname, cityName)) {
            ns.print(`No warehouse found in ${cityName}. creating one`)
            if (corp.getPurchaseWarehouseCost() < corp1.funds) {
                await corp.purchaseWarehouse(divname, cityName);
                ns.print("warehouse created in ", cityName);
            } else {
                ns.print(`FAILED: Insufficient funds to Purchase Warehouse in ${cityName}`);
                return;
            }
        } else ns.print(`SUCCESS: warehouse exists`)

        updateEmpMeta(ns, divname, cityName);

        var wh_size = corp.getWarehouse(divname, cityName).size; //get the current wh size
        ns.print(`Warehouse in ${cityName} is ${wh_size} of ${targetWHSize} `)
        // ns.print(cityName, " warehouse size: ", wh_size);
        // ns.print(cityName, " warehouse target: ", targetWHSize);

        var wh_size_used = corp.getWarehouse(divname, cityName).sizeUsed; //get the amt of the wh currently used
        var wh_percent_used = (wh_size_used / wh_size) * 100; // math for percentage wh utilization

        while (wh_size < targetWHSize || wh_percent_used > 75) { // if the wh is too small

            //ns.print(corp.getUpgradeWarehouseCost(divname, cityName)) 

            // UPGRADE the warehouse
            if (corp.getUpgradeWarehouseCost(divname, cityName) < corp1.funds) {
                await corp.upgradeWarehouse(divname, cityName);
                ns.print(`Warehouse upgraded. `)
                // reload wh stats before looping, ITERATOR
                wh_size = corp.getWarehouse(divname, cityName).size;
                wh_size_used = corp.getWarehouse(divname, cityName).sizeUsed; //get the amt of the wh currently used
                wh_percent_used = (wh_size_used / wh_size) * 100;
                ns.print(`Warehouse in ${cityName} is ${wh_size} of ${targetWHSize}, ${wh_percent_used}%utilized `)
                // await ns.sleep(1006);
            }
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    async function purchaseMaterials(ns, div, cityName) {
        ns.print(`Getting materials...`)

        for (let material of materials) {

            let wh_size = corp.getWarehouse(div, cityName).size;
            let wh_size_used = corp.getWarehouse(div, cityName).sizeUsed; //get the amt of the wh currently used
            let wh_percent_used = (wh_size_used / wh_size) * 100;
            let currentstock = corp.getMaterial(div, cityName, material[0]).qty;
            let desiredStock = ((wh_size / 2) * material[1]);
            let amt = desiredStock - currentstock;

            ns.print(`Checking ${material[0]} in ${cityName}, has ${currentstock} of ${desiredStock}`);

            if (amt > 0) {
                while (currentstock < desiredStock) {
                    ns.print(`Not enough ${material[0]}, purchasing ${(amt)}/sec until we have ${desiredStock}.`);
                    await corp.buyMaterial(div, cityName, material[0], (0.1 * amt));
                    await ns.sleep(10000)
                    currentstock = corp.getMaterial(div, cityName, material[0]).qty
                }
                await corp.buyMaterial(div, cityName, material[0], 0) //reset to 0 after buy cycle
            }



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



    async function hrDept(ns, div, cityName) {


        // load all of the employee objects into an array
        updateEmpMeta(ns, div, cityName);
        // look for the best cadidates for each job
        for (let job of jobStats) {
            let employeeTemp = employeeDB.sort(dynamicSort(job.primeStat))//.slice(0, -(employeeDB.length - job[phase]));


            //employeeMeta[job.name];
            ns.print(`Initial count for ${job.name} is ${employeeMeta[job.name]}`)
            if (employeeMeta[job.name] >= job[phase]) {
                ns.print(`${job.name} employees already hired (${employeeMeta[job.name]} of ${job[phase]})....`);
                continue;
            } else ns.print(`Not enough employees assigned to ${job.name}`);



            for (let employee of employeeTemp) {
                //ns.print(`${employee.pos}`)
                if (employee.pos == "Unassigned" && employeeMeta[job.name] < job[phase]) {
                    ns.print(`Assigning Name: ${employee.name} - ${job.primeStat} = ${employee[job.primeStat]} to ${job.name}`);

                    await corp.assignJob(div, cityName, employee.name, job.name)
                    ns.print(`SUCCESS, ${employeeMeta[job.name]} of ${job[phase]}`);
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
            purchaseUnlock(ns, unlock);
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

            if (!division.cities.includes(cityName)) {
                if (corp.getExpandCityCost() < corp1.funds) {
                    ns.print("Not in ", cityName, " yet, expanding....");
                    //expand into this city
                    corp.expandCity(division.name, cityName);
                    ns.print(division.name, " expanded into ", cityName);
                } else ns.print("FAILED: insufficient funds to expand ", division.name, " to ", cityName);
            } else ns.print(`SUCCESS: in ${cityName}, ${div} already exists.`);

            // check for a warehouse and if its affordable
            if (!corp.hasWarehouse(division.name, cityName)) {
                if (corp.getPurchaseWarehouseCost() < corp1.funds) {
                    corp.purchaseWarehouse(division.name, cityName); //make a warehouse 
                    ns.print("warehouse created in ", cityName);
                } else ns.print(`FAILED: Insufficient funds to Purchase Warehouse in ${cityName}`);
            } else ns.print(`SUCCESS: Warehouse already exists in ${cityName}`);


            // if making the warehouse was successful, purchase the first round of materials for the warehouse
            /* 
             if (division.name == "Tobacco"){
                 await productMaker(ns, division.name, cityName);
 
             }*/

            if (corp.hasWarehouse(division.name, cityName)) {

                let prodmats = industryDB.find(d => d.name == division.name).prodMats;
                for (let prod of prodmats) {
                    await corp.sellMaterial(division.name, cityName, prod, "MAX", "MP");
                    ns.print(`SUCCESS: ${prod} set to be sold in ${cityName}`);
                    // await corp.sellMaterial(division.name, cityName, "Plants", "MAX", "MP");
                    // ns.print("Plants set to be sold in ", cityName);
                }
                var warehouse = corp.getWarehouse(division.name, cityName);

                // if smartsupply is not enabled, enable it
                if (!warehouse.smartSupplyEnabled) {

                    await corp.setSmartSupply(division.name, cityName, true);
                    ns.print("Smart Supply enabled for ", cityName);
                }
            }

            await officeUpgrader(ns, division.name, cityName)
            await ns.sleep(1021)
            //hire the first round of emplyees
            await fillOffice(ns, division.name, cityName);
            await ns.sleep(1001);
            //setup the initial round of advertising
            await advertise(ns, division.name);
            await ns.sleep(1002);
            // corp levelable upgrades
            await corpUpgrader(ns);
            await ns.sleep(1003);
            // upgrade warehouse
            await whUpgrader(ns, division.name, cityName);
            await ns.sleep(1004);
            // purchase the first round of materials to stock our upgraded warehouse
            await purchaseMaterials(ns, division.name, cityName);
            await ns.sleep(1005);
        }


    }


    corp1 = corp.getCorporation(); // corp1 stats
    /* FIRST MONITORING HOLD
            WAIT HERE until profits are greater than 1.5M/s
     
    */
    while ((corp1.revenue - corp1.expenses) < 1.5e6) {
        ns.print("Waiting on profit threshold ... ");
        await ns.sleep(10001);
        corp1 = corp.getCorporation();
    }

    while ((corp1.revenue - corp1.expenses) >= 1.5e6) {
        await ns.sleep(10008);
        if (getNoffer(ns)) break;

    }



    /////////////// PHASE TWO
    /*
        phase = 2;
    
        for (let div of corp1.divisions) { //loop through divisions
            //check for the division 
            if (corp1.divisions.find(d => d.type === targetDiv)) {
    
                for (let cityName of cities) { //loop through city master list
    
                    if (div.cities.find(d => d === cityName) && corp.hasWarehouse(div.name, cityName)) {
                        await
    
    
                            officeUpgrader(ns, div.name, cityName, targetOfficeSize);
    
                    }
    
    
                }
            }
    
    
        }
    */
    ///////////////////////////////////////

    /*
    updateBaseData(ns);
    let divisions = [];
    for (const division of corp1.divisions) {
 
        let name = division.name
        divisions.push(name);
        ns.print(name)
    }
    */



    ///////////////////////// FUNCTIONS /////////////////////////////////////////



    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Hardware 125 (12.5), AI Cores 75 (7.5), Real Estate 27k (2.7k)

    /*
    for (const city of cities) {
        let hardware = corp.getMaterial("Agriculture", city, "Hardware");
        let aiCores = corp.getMaterial("Agriculture", city, "AI Cores");
        let realEstate = corp.getMaterial("Agriculture", city, "Real Estate");
 
        if (hardware.qty < 125) {
            corp.buyMaterial("Agriculture", city, "Hardware", (125 - hardware.qty) / 10);
            hardware = corp.getMaterial("Agriculture", city, "Hardware");
            await ns.sleep(50);
        }
        corp.buyMaterial("Agriculture", city, "Hardware", 0);
 
        if (aiCores.qty < 75) {
            corp.buyMaterial("Agriculture", city, "AI Cores", (75 - aiCores.qty) / 10);
            aiCores = corp.getMaterial("Agriculture", city, "AI Cores");
            await ns.sleep(50);
        }
        corp.buyMaterial("Agriculture", city, "AI Cores", 0);
 
        if (realEstate.qty < 27000) {
            corp.buyMaterial("Agriculture", city, "Real Estate", (27000 - realEstate.qty) / 10);
            realEstate = corp.getMaterial("Agriculture", city, "Real Estate");
            await ns.sleep(50);
        }
        corp.buyMaterial("Agriculture", city, "Real Estate", 0);
    }
*/
    // set prices

    /*
        // set people
        for (const city of cities) {
            let office = corp.getOffice("Agriculture", city);
            if (office.employees.length < 3) {
                for (let i = 0; i < 3 - office.employees.length; i++) corp.hireEmployee("Agriculture", city);
            }
            office = corp.getOffice("Agriculture", city);
            await corp.assignJob("Agriculture", city, office.employees[0], "Operations");
            await corp.assignJob("Agriculture", city, office.employees[1], "Engineer");
            await corp.assignJob("Agriculture", city, office.employees[2], "Business");
        }*/
}
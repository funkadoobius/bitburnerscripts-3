
/**  
 * 
 @param {NS} ns */


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////// MAIN BLOCK ///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function main(ns) {

    let player = ns.getPlayer();

    let multi = player.bitNodeN === 1 || player.bitNodeN === 3 ? 1 : 0;
    //if (dictSourceFiles[5] > 0) multi = ns.getBitNodeMultipliers().CorporationValuation;

    /**if (!ns.corporation.hasUnlockUpgrade("Warehouse API") && ns.corporation.getUnlockUpgradeCost("Warehouse API") > corp.funds) {
        throw new Error("FAILED: Insufficient funds for Warehouse API, required")
    } else if (!ns.corporation.hasUnlockUpgrade("Warehouse API") && ns.corporation.getUnlockUpgradeCost("Warehouse API") < corp.funds) {
        ns.corporation.unlockUpgrade("Warehouse API");
    }**/

    const phase = 1;// args[0];
    const rootname = "FUBAR";
    const targetDiv = "Agriculture";

    //let corp = ns.corporation.getCorporation(); //refresh corp stats
    const cities = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"];

    var jobs = [];
    var materials = [];
    var corpUpgrades = [];
    var corpUnlockables = [];
    var divUpgrades = [];
    var advertTarget = 0;
    //let dictSourceFiles = await getActiveSourceFiles(ns);

    var targetOfficeSize = 0;
    var targetWHSize = 0;

    const preferredUpgradeOrder = [
        "Smart Supply",
    ];

    const preferredIndustryOrder = [
        "Agriculture",
        "Software",
        "Tobacco"
    ]

    switch (phase) {
        case 1:
            targetOfficeSize = 3;
            targetWHSize = 300;
            advertTarget = 2;

            jobs = [
                ["Research & Development", 0],
                ["Business", 1],
                ["Engineer", 1],
                ["Management", 0],
                ["Operations", 1],
                ["Training", 0]
            ]

            materials = [
                ["Hardware", 2800],
                ["AI Cores", 2520],
                ["Real Estate", 146400],
                ["Robots", 0],
            ];

            corpUpgrades = [
                ["FocusWires", 2],
                ["Neural Accelerators", 2],
                ["Speech Processor Implants", 2],
                ["Nuoptimal Nootropic Injector Implants", 2],
                ["Smart Storage", 0],
                ["Smart Factories", 2],
                ["Wilson Analytics", 0],
                ["Project Insight", 0],
                ["Dreamsense", 0],
                ["ABC SalesBots", 0],
            ];

            corpUnlockables = [
                "Smart Supply"
            ];

            break;

        case 2:
            targetOfficeSize = 9;
            targetWHSize = 2000;
            advertTarget = 3;

            jobs = [
                ["Research & Development", 2],
                ["Business", 1],
                ["Engineer", 2],
                ["Management", 2],
                ["Operations", 2],
                ["Training", 0]
            ]

            materials = [
                ["Hardware", 2800],
                ["AI Cores", 2520],
                ["Real Estate", 146400],
                ["Robots", 96],
            ];

            corpUpgrades = [
                ["FocusWires", 2],
                ["Neural Accelerators", 2],
                ["Speech Processor Implants", 2],
                ["Nuoptimal Nootropic Injector Implants", 2],
                ["Smart Storage", 0],
                ["Smart Factories", 2],
                ["Wilson Analytics", 0],
                ["Project Insight", 0],
                ["Dreamsense", 0],
                ["ABC SalesBots", 0],

            ];
            corpUnlockables = [
                "Smart Supply"
            ];
            break;

        case 3:
            targetOfficeSize = 18;
            targetWHSize = 3800;
            advertTarget = 4;

            jobs = [
                ["Research & Development", 4],
                ["Business", 2],
                ["Engineer", 4],
                ["Management", 4],
                ["Operations", 4],
                ["Training", 0]
            ]

            materials = [
                ["Hardware", 2800],
                ["AI Cores", 2520],
                ["Real Estate", 146400],
                ["Robots", 96],
            ];

            corpUpgrades = [
                ["FocusWires", 2],
                ["Neural Accelerators", 2],
                ["Speech Processor Implants", 2],
                ["Nuoptimal Nootropic Injector Implants", 2],
                ["Smart Storage", 0],
                ["Smart Factories", 2],
                ["Wilson Analytics", 0],
                ["Project Insight", 0],
                ["Dreamsense", 0],
                ["ABC SalesBots", 0],

            ];
            corpUnlockables = [
                "Smart Supply"
            ];
            break;

        default:
            break;


    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    startCorp()
    check for a corp, if it doesnt exist make it based on the root name provided at the top
     
    */

    function startCorp(ns, rootname) { //function to start a corporation
        const player = ns.getPlayer(); // refresh player data
        const selfFund = player.money >= 1.5e11
        player.bitNodeN != 3
        if (selfFund) {
            const worked = ns.corporation.createCorporation(rootname, selfFund);
            return worked;
        } else if (!selfFund && player.bitNodeN == 3) {
            const worked = ns.corporation.createCorporation(rootname, selfFund);
            return worked;
        } else {
            ns.print("FAILED: Too poor to start a company and you're not in BN3 (required for seed money option)");
        }
        if (!worked) {
            ns.print("FAILED: Cant create ", rootname);
            return;
        }

    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    getNoffer()
    get an investment offer and accept based on the round number
    */


    function getNoffer(ns) {

        let offer = ns.corporation.getInvestmentOffer();
        var target_funds = 0;
        switch (offer.round) {
            case 1:
                target_funds = 2e11;
                break;
            case 2:
                target_funds = 3e12;
                break;
            case 3:
                target_funds = 3e14;
                break;
            case 4:
                target_funds = 3e17;
                break;

            default:
                break;
        }

        if (offer.funds > target_funds) {
            ns.corporation.acceptInvestmentOffer();
            let corp = ns.corporation.getCorporation();
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    createIndustry() 
    check for the presence of a particular industry based on a list array. if not found, create it.
    */

    function createIndustry(ns, div, city) {
        let corp = ns.corporation.getCorporation(); //refresh corp stats
        if (ns.corporation.getExpandIndustryCost(div.type) < corp.funds) {
            ns.corporation.expandIndustry(div.name, city);
            return;
        } else ns.print("FAILED: Insufficient funds to expand into ", div);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    purchaseUpgrade()
    purchase corp unlockable upgrades based on a predfined order list.
    */

    function purchaseUnlock(ns, corpUpgrade) {
        let corp = ns.corporation.getCorporation(); //refresh corp stats
        if (ns.corporation.getUnlockUpgradeCost(corpUpgrade) < corp.funds) {
            ns.corporation.unlockUpgrade(corpUpgrade);
            return;
        } else ns.print("FAILED: Insufficient funds to buy ", corpUpgrade);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    buildDivision(divIndex)
    build a division and expand in each city, accepts the index number of the desired division from the preferred industry list. start with 0
    then make a warehouse if we can afford it
    then set basic sales
    */

    function buildDivision(ns, divIndex) {
        let corp = ns.corporation.getCorporation();
        let div = preferredIndustryOrder[divIndex];


        let divExists = corp.divisions.find(d => d.type === div); //check for division
        if (!divExists) {//if there isnt one, make one, or move on to the next
            createIndustry(ns, div);
        };

        let division = ns.corporation.getDivision(div); // load div info 

        for (let unlock of preferredUpgradeOrder) { // purchase corp unlocks based on the list, like smart supply
            if (!hasUnlockUpgrade(unlock)) purchaseUnlock(ns, unlock);

        }

        //ns.print(division.cities);
        if (division.cities.length < cities.length) { // if the size of the array containing the cities this division is currently in is less than the total number of cites
            for (let city of cities) {

                if (!division.cities.includes(city) && ns.corporation.getExpandIndustryCost(div) < corp.funds) {
                    ns.corporation.expandCity(div, city);

                } else ns.print(`FAILED: Insufficient funds to expand ${div} into ${city}`);


                if (!ns.corporation.hasWarehouse(div, city)) {
                    corp = ns.corporation.getCorporation();
                    if (ns.corporation.getPurchaseWarehouseCost() < corp.funds) {
                        ns.corporation.purchaseWarehouse(div, city);
                    } else ns.print(`FAILED: Insufficient funds to Purchase Warehouse in ${city}`);

                }

                ns.corporation.sellMaterial(div, city, "Food", "MAX", "MP+10");
                ns.corporation.sellMaterial(div, city, "Plants", "MAX", "MP+10");

                if (!warehouse.smartSupplyEnabled) {
                    ns.corporation.setSmartSupply(div, city, true);

                }
            }
        }

    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function advertise(ns, div) {
        if (ns.corporation.getHireAdVertCount(div) < advertTarget) {
            corp = ns.corporation.getCorporation();
            if (ns.corporation.getHireAdVertCost(div) < corp.funds) {
                ns.corporation.hireAdVert(div);
            } else ns.pring(`FAILED: Insufficient funds to hire AdVert`);
            return;
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////


    function corpUpgrader(ns) {

        corpUpgrades.forEach(upgrade => {
            if (ns.corporation.getUpgradeLevelCost(upgrade[0]) > corp.funds) {
                throw new Error(`Insufficient funds to Upgrade ${upgrade} to level ${i}`);
            }
            let i = 1;
            while (i <= upgrade[1]) {
                ns.print(cityName, " ", upgrade[0], " ", upgrade[1]);
                ns.corporation.levelUpgrade(upgrade[0]);
                //await ns.sleep(200);
            }
        });
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////


    function officeUpgrader(ns, divname, cityName, newsize) {

        let thisOffice = ns.corporation.getOffice(divname, cityName);

        if (thisOffice.size < targetOfficeSize && ns.corporation.getOfficeSizeUpgradeCost(divname, cityName, (targetOfficeSize - thisOffice.size)) < corp.funds) {

            ns.corporation.upgradeOfficeSize(divname, cityName, (newsize - thisOffice.size))
            ns.print("added ", (newsize - thisOffice.size), " to office in ", cityName);
            //await ns.sleep(1000);
        }


    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    fillOffice(division name, city name)
    fill all open positions in the specified office, then iterate through a 3d array to auto assign employees to positions, determined by phase
    */
    function fillOffice(ns, divname, cityName) {

        let i = 0;
        let newhires = thisOffice.size - thisOffice.employees.length;

        while (i < newhires) {
            ns.print("#employees: ", thisOffice.employees.length, " - office size: ", thisOffice.size)
            ns.corporation.hireEmployee(divname, cityName);
            ns.print("hired employee in ", cityName, ", ", (newhires - i), " left to go.");
            //await ns.sleep(1000);
            i++;
        }

        jobs.forEach(job => {
            ns.print(cityName, " ", job[0], " ", job[1]);
            ns.corporation.setAutoJobAssignment(divname, cityName, job[0], job[1]);

            //await ns.sleep(1000);
        });
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    whUpgrader(division name, city name)
    increase the size of the warehouse, based on phase, 
    */

    function whUpgrader(ns, divname, cityName) {
        var wh_size = ns.corporation.getWarehouse(div.name, cityName).size; //get the current wh size
        var wh_size_used = ns.corporation.getWarehouse(div.name, cityName).sizeUsed; //get the amt of the wh currently used
        var wh_percent_used = (wh_size_used / wh_size) * 100; // math for percentage wh utilization

        while (wh_size < targetWHSize) { // if the wh is too small
            // ns.print(wh_size);
            // ns.print(wh_percent_used.toFixed(0));
            // ns.print(div.name);
            // ns.print(cityName);
            ns.print(ns.corporation.getUpgradeWarehouseCost(div.name, cityName)) // upgrade the wh

            // reload wh stats before looping
            ns.corporation.upgradeWarehouse(div.name, cityName);
            wh_size = ns.corporation.getWarehouse(div.name, cityName).size;
            wh_size_used = ns.corporation.getWarehouse(div.name, cityName).sizeUsed;
            wh_percent_used = (wh_size_used / wh_size) * 100;

            //await ns.sleep(200);

        }
    }



    if (!player.hasCorporation) startCorp(ns, rootname); //chech for a corp, make one if needed

    let corp = ns.corporation.getCorporation(); //refresh corp stats


    //build a division, set up the inicial warehouse, and the selling of products
    //purchase inicial ulockables
    buildDivision(ns, 0);

    for (let div of corp.divisions) { //loop through divisions
        let divExists = corp.divisions.find(d => d.type === targetDiv); //check for the division were managing

        if (divExists) {

            for (let cityName of div.cities) {

                officeUpgrader(ns, div.name, cityName, targetOfficeSize);
                fillOffice(ns, div.name, cityName);
                whUpgrader(ns, div.name, cityName);
                advertise(ns, div.name);
                corpUpgrader(ns);


                for (let material of materials) {
                    var amt = 0;
                    let currentstock = ns.corporation.getMaterial(div.name, cityName, materials[material]).qty
                    switch (materials[material]) {
                        case "Hardware":
                            if (currentstock < hardware_amt) amt = hardware_amt - currentstock;
                            break;
                        case "AI Cores":
                            if (currentstock < core_amt) amt = core_amt - currentstock;
                            break;
                        case "Real Estate":
                            if (currentstock < realestate_amt) amt = realestate_amt - currentstock;
                            break;
                        case "Robots":
                            if (currentstock < robot_amt) amt = robot_amt - currentstock;
                            break;
                        default:
                            amt = 0;
                            break;
                    }

                    ns.print(div.name)
                    ns.print(cityName);
                    ns.print(materials[material]);
                    ns.print(amt);

                    if (amt > 0) ns.corporation.buyMaterial(div.name, cityName, materials[material], (0.1 * amt));
                    await ns.sleep(1000)
                    ns.corporation.buyMaterial(div.name, cityName, materials[material], 0)

                }


            }
        }


    }

    ///////////////////////////////////////

    /*
    let corp = ns.corporation.getCorporation()
    let divisions = [];
    for (const division of corp.divisions) {

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
        let hardware = ns.corporation.getMaterial("Agriculture", city, "Hardware");
        let aiCores = ns.corporation.getMaterial("Agriculture", city, "AI Cores");
        let realEstate = ns.corporation.getMaterial("Agriculture", city, "Real Estate");

        if (hardware.qty < 125) {
            ns.corporation.buyMaterial("Agriculture", city, "Hardware", (125 - hardware.qty) / 10);
            hardware = ns.corporation.getMaterial("Agriculture", city, "Hardware");
            await ns.sleep(50);
        }
        ns.corporation.buyMaterial("Agriculture", city, "Hardware", 0);

        if (aiCores.qty < 75) {
            ns.corporation.buyMaterial("Agriculture", city, "AI Cores", (75 - aiCores.qty) / 10);
            aiCores = ns.corporation.getMaterial("Agriculture", city, "AI Cores");
            await ns.sleep(50);
        }
        ns.corporation.buyMaterial("Agriculture", city, "AI Cores", 0);

        if (realEstate.qty < 27000) {
            ns.corporation.buyMaterial("Agriculture", city, "Real Estate", (27000 - realEstate.qty) / 10);
            realEstate = ns.corporation.getMaterial("Agriculture", city, "Real Estate");
            await ns.sleep(50);
        }
        ns.corporation.buyMaterial("Agriculture", city, "Real Estate", 0);
    }
*/
    // set prices

    /*
        // set people
        for (const city of cities) {
            let office = ns.corporation.getOffice("Agriculture", city);
            if (office.employees.length < 3) {
                for (let i = 0; i < 3 - office.employees.length; i++) ns.corporation.hireEmployee("Agriculture", city);
            }
            office = ns.corporation.getOffice("Agriculture", city);
            await ns.corporation.assignJob("Agriculture", city, office.employees[0], "Operations");
            await ns.corporation.assignJob("Agriculture", city, office.employees[1], "Engineer");
            await ns.corporation.assignJob("Agriculture", city, office.employees[2], "Business");
        }*/
}
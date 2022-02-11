import {
    formatRam, formatDateTime, formatNumber,
    scanAllServers, hashCode, log as logHelper, getFilePath,
    getNsDataThroughFile_Custom, runCommand_Custom, waitForProcessToComplete_Custom,
    tryGetBitNodeMultipliers_Custom, getActiveSourceFiles_Custom,
    getFnRunViaNsExec, getFnIsAliveViaNsPs,
    getNsDataThroughFile, runCommand, getActiveSourceFiles, tryGetBitNodeMultipliers,
    formatDuration, formatMoney, formatNumberShort, disableLogs
} from './helpers.js'

//const argsSchema = [
//   ['h', false],
//];

//export function autocomplete(data, args) {
//    data.flags(argsSchema);
//    return [];
//}

/** 
 * 
 * 
 * 
 * 
 * 
 * @param @param {import(".").NS } ns **/
 const phase = args[0];
 const rootname = "FUBAR";
 const targetDiv = "Agriculture";
 const player = ns.getPlayer();
 let corp = ns.corporation.getCorporation(); //refresh corp stats

 const jobs = [];

 const cities = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"];

 const upgrades = ["FocusWires", "Neural Accelerators", "Speech Processor Implants",
     "Nuoptimal Nootropic Injector Implants", "Smart Factories"];

 let dictSourceFiles = await getActiveSourceFiles(ns);
 
 const targetOfficeSize = 0;

 const preferredUpgradeOrder = [
    "Smart Supply",
];

const preferredIndustryOrder = [
    "Agriculture",
    "Software",
]

switch (phase) {
	case 1:
		jobs = [
			["Research & Development", 0],
			["Business", 1],
			["Engineer", 1],
			["Management", 0],
			["Operations", 1],
			["Training", 0]
		]
		targetOfficeSize = 3;

        materials = [
			["Hardware", 2800],
			["AI Cores", 2520],
			["Real Estate", 146400],
			["Robots", 0],
		];

		break;

	case 2:
		jobs = [
			["Research & Development", 2],
			["Business", 1],
			["Engineer", 2],
			["Management", 2],
			["Operations", 2],
			["Training", 0]
		]
		targetOfficeSize = 9;

        materials = [
			["Hardware", 2800],
			["AI Cores", 2520],
			["Real Estate", 146400],
			["Robots", 96],
		];

		break;

	case 3:
		jobs = [
			["Research & Development", 4],
			["Business", 2],
			["Engineer", 4],
			["Management", 4],
			["Operations", 4],
			["Training", 0]
		]
		targetOfficeSize = 18;
        
        materials = [
			["Hardware", 2800],
			["AI Cores", 2520],
			["Real Estate", 146400],
			["Robots", 96],
		];

		break;

	default:
		break;

        
    }

    export function getNoffer(ns, round) {

        switch (round) {
            case 1:
            let target_funds = 2e11;
                let roundOne = ns.corporation.getInvestmentOffer();
                if (roundOne.round === 1) {
                    //await prepRoundOne(ns);
                    if (roundOne.funds < target_funds) {
                        //await ns.sleep(10 * 1000); //move timer
                        roundOne = ns.corporation.getInvestmentOffer();
                    }
                    ns.corporation.acceptInvestmentOffer();
                    const corp = ns.corporation.getCorporation();
                    if (corp.funds < target_funds) ns.print("Investment offer not sufficient, try again in 10s")

                }
                break;

                
            case 2:
            let target_funds = 3e12;

                let roundTwo = ns.corporation.getInvestmentOffer();
                if (roundTwo.round === 2) {
                    //await prepRoundOne(ns);
                    if (roundTwo.funds < target_funds) {
                        //await ns.sleep(10 * 1000); //move timer
                        roundTwo = ns.corporation.getInvestmentOffer();
                    }
                    ns.corporation.acceptInvestmentOffer();
                    const corp = ns.corporation.getCorporation();
                    if (corp.funds < target_funds) ns.print("Investment offer not sufficient, try again in 10s")

                }

                break;


            default:
                break;
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

    export function startCorp(ns, rootname) { //function to start a corporation
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

    function createIndustry(ns, div) {
        let corp = ns.corporation.getCorporation(); //refresh corp stats
        if (ns.corporation.getExpandIndustryCost(div) > corp.funds) {
            ns.print("FAILED: Insufficient funds to expand into ", div);
            return;
        }
        ns.corporation.expandIndustry(div, rootname.concat(div));
        return true;
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function purchaseUpgrade(ns, upgrade) {
        let corp = ns.corporation.getCorporation(); //refresh corp stats
        if (ns.corporation.getUnlockUpgradeCost(upgrade) > corp.funds) {
            ns.print("FAILED: Insufficient funds to buy ", upgrade);
            return;
        }
        ns.corporation.unlockUpgrade(upgrade);
        return true;
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function buildDivisions(ns) {
        let corp = ns.corporation.getCorporation();
    
        for (let div of preferredIndustryOrder) {
            let divExists = corp.divisions.find(d => d.type === div); //check for division
            if (!divExists) {
                createIndustry(ns, div);
    
            };//if there isnt one, make one, or move on to the next
    
            let division = ns.corporation.getDivision(rootname.concat(div)); // load object from the table
            let currentCities = [];
    
            //ns.print(division.cities);
            if (division.cities.length < cities.length) { // if the div is in every city, move on
                for (const city of cities) {
                    if (division.cities.includes(city)) currentCities.push(city);
                    if (!division.cities.includes(city) && ns.corporation.getExpandCityCost() < corp.funds) {
                        ns.corporation.expandCity(rootname.concat(div), city);
                        currentCities.push(city);
                    } else {
                        ns.print(`FAILED: Insufficient funds to expand ${div} into ${city}`);
                        ;
                    }
                }
            }
            for (const city of currentCities) {
                if (!ns.corporation.hasWarehouse(rootname.concat(div), city)) {
                    corp = ns.corporation.getCorporation();
                    if (ns.corporation.getPurchaseWarehouseCost() < corp.funds) {
                        ns.corporation.purchaseWarehouse(rootname.concat(div), city);
                    } else ns.print(`FAILED: Insufficient funds to Purchase Warehouse in ${city}`);
    
                }
    
                let warehouse = ns.corporation.getWarehouse(rootname.concat(div), city);
    
                if (warehouse.size < 300) {
                    corp = ns.corporation.getCorporation();
                    if (ns.corporation.getUpgradeWarehouseCost(rootname.concat(div), city) < corp.funds) {
                        ns.corporation.upgradeWarehouse(rootname.concat(div), city);
                        warehouse = ns.corporation.getWarehouse(rootname.concat(div), city);
                    } else {
                        ns.print(`FAILED: Insufficient funds to Upgrade Warehouse in ${city}`);
    
                    }
    
                }
    
                ns.corporation.sellMaterial(rootname.concat(div), city, "Food", "MAX", "MP+10");
                ns.corporation.sellMaterial(rootname.concat(div), city, "Plants", "MAX", "MP+10");
    
                if (!warehouse.smartSupplyEnabled) {
                    ns.corporation.setSmartSupply(rootname.concat(div), city, true);
    
                }
            }
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    function advertise(ns, div) {
        if (ns.corporation.getHireAdVertCount(div) < 4) {
            corp = ns.corporation.getCorporation();
            if (ns.corporation.getHireAdVertCost(div) < corp.funds) {
                ns.corporation.hireAdVert(div);
            } else ns.pring(`FAILED: Insufficient funds to hire AdVert`);
            return;
        }
    }
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    
    function officeUpgrade(ns, div) {
        for (let i = 1; i <= 2; i++) {
            for (const upgrade of upgrades) {
                const level = ns.corporation.getUpgradeLevel(upgrade);
                if (level >= i) continue;
    
                corp = ns.corporation.getCorporation();
                if (ns.corporation.getUpgradeLevelCost(upgrade) > corp.funds) {
                    throw new Error(`Insufficient funds to Upgrade ${upgrade} to level ${i}`);
                }
                ns.corporation.levelUpgrade(upgrade);
            }
        }
    }


export async function main(ns) {

    
    let bitnodeMults = await tryGetBitNodeMultipliers(ns);




    let corp = ns.corporation.getCorporation(); //refresh corp stats

    let multi = player.bitNodeN === 1 || player.bitNodeN === 3 ? 1 : 0;
    if (dictSourceFiles[5] > 0) multi = ns.getBitNodeMultipliers().CorporationValuation;

    if (!ns.corporation.hasUnlockUpgrade("Warehouse API") && ns.corporation.getUnlockUpgradeCost("Warehouse API") > corp.funds) {
        throw new Error("FAILED: Insufficient funds for Warehouse API, required")
    } else if (!ns.corporation.hasUnlockUpgrade("Warehouse API") && ns.corporation.getUnlockUpgradeCost("Warehouse API") < corp.funds) {
        ns.corporation.unlockUpgrade("Warehouse API");
    }




    // DO THE THINGS IN ORDER /////////////

    if (!player.hasCorporation) startCorp(ns, rootname);

    getNoffer(ns); //get initial funding offer

    for (let upgrade of preferredUpgradeOrder) {    // Check for and purchase initial upgrades
        let hasUpgrade = ns.corporation.hasUnlockUpgrade(upgrade);
        if (!hasUpgrade) purchaseUpgrade(ns, upgrade)
    }

    buildDivisions(ns); //create division framework

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
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
    let maintLoopCounter = args[`loop`]
    //const cities = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"];

    const corp = eval("ns.corporation"); ///shhhh
    let corp1 = corp.getCorporation(); // corp1 stats
    let division = corp.getDivision(div)
    let upgradeSpeed = 0.9;
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
    /////////////////////////////////////////////////////////////////////////////////////////////

    let employeeDB = [];

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
    let upgradeScale = logBase(8, phase); // 10000

    async function updateBaseData(ns) {
        corp1 = corp.getCorporation();
        profit = (corp1.revenue - corp1.expenses);
        division = corp.getDivision(div);
        upgradeScale = logBase(8, phase);
        incomeThreshold = Math.pow(1.5e6, upgradeScale);
        upgradeSpeed = 0.9//1 / logBase(phase + 10, industryDB.find(d => d.name == division.type).upFac) / 10;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    
    UPDATE Stat database
    cant use this function until corp/divs created. 
    */

    async function updateEmpMeta(ns, divname, cityName) {

        updateBaseData(ns);
        let office = corp.getOffice(divname, cityName);
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
            sumEne += employee.ene;
        }
        avgHap = sumHap / employeeDB.length;
        avgEne = sumEne / employeeDB.length;

        employeeMeta.avgHap = avgHap;
        employeeMeta.avgEne = avgEne;
    }

    //let execute = eval("ns.exec")

    let divname = div
    updateEmpMeta(ns, divname, cityName);

    //ns.tprint(`${division.name} PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: Checking for office upgrades...`);

    let thisOffice = corp.getOffice(divname, cityName);
    let upgradeSize = 10;
    maintLoopCounter % 10 == 0 ? upgradeSize = 1 : upgradeSize;
    upgradeSize = 0 ? upgradeSize += 1 : upgradeSize;
    let cost = corp.getOfficeSizeUpgradeCost(divname, cityName, upgradeSize)

    //ns.tprint(`MATH: ${formatMoney(cost)} < ${formatMoney(corp1.funds)}`)
    if (cost < corp1.funds * 0.5 && employeeMeta.avgEne > 99.9 && employeeMeta.avgHap > 99.9) {
        ns.tprint(`PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: Office upgrades available. Happiness and Energy recovered`);
        if (await corp.upgradeOfficeSize(divname, cityName, upgradeSize)) {
            ns.tprint(`SUCCESS: ${division.name} PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: : added ${upgradeSize} cubicles to office `);
        } else ns.tprint(`FAILED: ${division.name} PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: : could not add ${upgradeSize} cubicles to office `);

        await ns.sleep(1007);

    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    updateEmpMeta(ns, divname, cityName);
    //ns.tprint(`${cityName}: Hiring employees to fill the office...`);
    thisOffice = corp.getOffice(divname, cityName);
    let i = thisOffice.employees.length;
    let newhires = thisOffice.size - i;
    //ns.tprint(`INFO: ${division.name} PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}:  Current employees: ${i}, of ${thisOffice.size}. ${newhires}  newhires needed`);


    while (i < thisOffice.size) {
        await corp.hireEmployee(divname, cityName);
        i++;
        ns.tprint(`SUCCESS: ${division.name} PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}:  hired employee ${i} of ${thisOffice.size}`);
        await ns.sleep(100);
    }

    updateEmpMeta(ns, div, cityName);

    if (shuffle) {
        for (let employee of employeeDB) {
            await corp.assignJob(div, cityName, employee.name, "Unassigned")
            // load all of the employee objects into an a await whUpgrader(ns, divname, cityName);mployee.name, "Unassigned")
            ns.tprint(`INFO: ${division.name} PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName} Unassigned ${employee.name} to be reassigned a new job.`)
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
                ns.tprint(`SUCCESS: ${division.name} PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: ${employeeMeta[job.name] + 1} of ${jobTarget}`);
                ns.tprint(`INFO: ${division.name} PHASE/LOOP:${phase}/${maintLoopCounter} ${cityName}: Assigning Name: ${employee.name} - ${job.primeStat} = ${employee[job.primeStat]} to ${job.name}`);
                employeeDB[employee.pos] = job.name;

                employeeMeta[job.name] += 1;
                await ns.sleep(1010);

            }

        };

        updateEmpMeta(ns, div, cityName);
    }
    await ns.sleep(100000)
}
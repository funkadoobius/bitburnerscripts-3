/**  
 * 
 @param {NS} ns */

 export async function main(ns) {
    const corp = eval("ns.corporation");

    let div = "ag";
    let division = corp.getDivision(div);
    let DBmeta = {
        "Total": 0,
        "Research & Development": 0,
        "Business": 0,
        "Engineer": 0,
        "Management": 0,
        "Operations": 0,
        "Training": 0,
        "highestINT": 0,
        "highestCHA": 0,
        "highestEXP": 0,
        "highestCRE": 0,
        "highestEFF": 0,

    };

    let employeeDB = [];

    let office = corp.getOffice(division.name, "Aevum");

    office.employees.forEach(name => {
        let tempEmployee = corp.getEmployee(div, "Aevum", name);

        // add additional fields that we will need later
        tempEmployee.highestStat = "";

        employeeDB.push(tempEmployee);
    });

    let tempStats = [
        ["int", tempEmployee.int],
        ["cha", tempEmployee.cha],
        ["exp", tempEmployee.exp],
        ["cre", tempEmployee.cre],
        ["eff", tempEmployee.eff]
    ];

    tempStats.sort((a, b) => b[1] - a[1]);

    //switch(tempStats[0])
    ns.print(tempStats);


    ns.print(employeeDB);

    for (let employee of employeeDB) {
        DBmeta.Total += 1;
        DBmeta[employee.pos] += 1; //position counter
        ns.print(DBmeta);
    }
}
// count the employees in each job title


    //ns.print(employeeDB);

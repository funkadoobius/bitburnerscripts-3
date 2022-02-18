/**  
 * 
 @param {NS} ns */


/*
TODO: take args for div and city
conver jobs from multiD array to an array of objects
*/
export async function main(ns) {
    const corp = eval("ns.corporation");

    let div = "ag";
    let city = "Sector-12";
    let division = corp.getDivision(div);
    let office = corp.getOffice(division.name, city);
    //let jobs = ["Operations", "Engineer", "Business", "Management", "Research & Development", "Training"];


    let employeeDB = [];
    let DBmeta = {
        "Total": 0,
        "Research & Development": 0,
        "Business": 0,
        "Engineer": 0,
        "Management": 0,
        "Operations": 0,
        "Training": 0
    };

    let jobs = [{
        name: "Research & Development",
        target: 2,
        primeStat: "int"
    },
    {
        name: "Business",
        target: 2,
        primeStat: "cha"
    },
    {
        name: "Engineer",
        target: 4,
        primeStat: "exp"
    },
    {
        name: "Management",
        target: 2,
        primeStat: "cha"
    }, //management has cha priority in ordering
    {
        name: "Operations",
        target: 5,
        primeStat: "eff"
    },
    {
        name: "Training",
        target: 0,
        primeStat: ""
    }
    ]

    // load all of the eployee objects into an array
    ns.print(`Accessing Employee Data....`);
    office.employees.forEach(name => {
        let tempEmployee = corp.getEmployee(div, city, name);
        employeeDB.push(tempEmployee);
    });
    ns.print(`Employee Database complete....`);

    // compile some useful meta
    for (let employee of employeeDB) {
        DBmeta.Total += 1;
        DBmeta[employee.pos] += 1; //position counter

        //ns.print(DBmeta);
    }
    ns.print(`DBmetaData compiled....`);
    // look for the best cadidates for each job
    for (let job of jobs) {
        let employeeTemp = employeeDB.sort(dynamicSort(job.primeStat)) //.slice(0, -(employeeDB.length - job.target));
        let counter = DBmeta[job.name];
        if (counter >= job.target) {
            ns.print(`${job.name} employees already hired (${DBmeta[job.name]} of ${job.target})....`);
            continue;
        };
        for (let employee of employeeTemp) {
            //ns.print(`${employee.pos}`)
            if (employee.pos == "Unassigned" && counter < job.target) {
                ns.print(`Assigning Name: ${employee.name} - ${job.primeStat} = ${employee[job.primeStat]} to ${job.name}`);
                if (ns.corporation.assignJob(div, city, employee.name, job.name)) {
                    ns.print(`SUCCESS, ${counter} of ${job.target}`);
                    employeeDB[employee.pos] = job.name;

                    counter++;
                    await ns.sleep(1010);
                }

            }

        };

        /*
        //debugging prints
                ns.print(`=======================================`);
                ns.print(`${job.name}`);
                ns.print(`------------`);
                ns.print(`primeStat: ${job.primeStat}`);
                ns.print(`target: ${job.target} for ${job.name}`);
                ns.print(`TOTAL TRANSFERS: ${employeeTransfers.length}`);
                ns.print(employeeTransfers);
        */



    }


    /*
            let tempStats = [
                ["int", tempEmployee.int],
                ["cha", tempEmployee.cha],
                ["exp", tempEmployee.exp],
                ["cre", tempEmployee.cre],
                ["eff", tempEmployee.eff]
            ];
        
        tempStats.sort((a, b) => b[1] - a[1]);

        switch(tempStats[0])
        ns.print(tempStats);


        ns.print(employeeDB);
    */

}

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
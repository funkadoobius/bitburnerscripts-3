function scan(ns, parent, server, list) {
    const children = ns.scan(server);
    for (let child of children) {
        if (parent == child) {
            continue;
        }
        list.push(child);
        scan(ns, server, child, list);
    }
}

export function list_servers(ns) {
    const list = [];
    scan(ns, '', 'home', list);
    return list;
}

/** @param {NS} ns **/
export async function main(ns) {
    const args = ns.flags([["help", false]]);
    if (args.help) {
        ns.tprint("This script roots any server that has a low enough minHackLevel and minPortsOpen requirements. Pass script as an argument to transmit to rooted machines.");
        ns.tprint(`Usage: run ${ns.getScriptName()} script script_arguments`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()}`);
        return;
    }

    var i = 0;
    var j = 0;
    var numPortsAvail = 0;

    const script = ns.args[0];


    var script_args = ns.args[1];

    if (ns.fileExists("BruteSSH.exe", "home")) { numPortsAvail++ }
    if (ns.fileExists("FTPCrack.exe", "home")) { numPortsAvail++ }
    if (ns.fileExists("relaySMTP.exe", "home")) { numPortsAvail++ }
    if (ns.fileExists("HTTPWorm.exe", "home")) { numPortsAvail++ }
    if (ns.fileExists("SQLInject.exe", "home")) { numPortsAvail++ }

    let pservblocker = /pserv.*/;
    let homeblocker = /home/;


    const servers = list_servers(ns).filter(s => ns.getServerRequiredHackingLevel(s) <= ns.getHackingLevel() && !homeblocker.test(s) && !pservblocker.test(s) && ns.getServerMaxRam(s) > 1);




    for (const server of servers) {



        i++; // count servers

        //
        // ROOT SERVERS ===================================================
        //
        //ns.tprint(`=============================`);
        if (ns.fileExists("BruteSSH.exe", "home")) {
            if (await ns.brutessh(server)) {
                //ns.tprint(`${server} is brute forced.`)
            }
        }
        if (ns.fileExists("FTPCrack.exe", "home")) {
            if (await ns.ftpcrack(server)) {
                //ns.tprint(`${server} is cracked.`)
            }
        }
        if (ns.fileExists("relaySMTP.exe", "home")) {
            if (await ns.relaysmtp(server)) {
                //ns.tprint(`${server} is relayed.`)
            }
        }
        if (ns.fileExists("HTTPWorm.exe", "home")) {
            if (await ns.httpworm(server)) {
                //ns.tprint(`${server} is wormed.`)
            }
        }
        if (ns.fileExists("SQLInject.exe", "home")) {
            if (await ns.sqlinject(server)) {
                //ns.tprint(`${server} is injected.`)
            }
        }

        if (ns.getServerNumPortsRequired(server) <= numPortsAvail) {

            //ns.tprint(`nuking ${server} - ${numPortsAvail} of ${ns.getServerNumPortsRequired(server)} ports requied `);
            await ns.nuke(server);
            //ns.tprint(`${server} is rooted.`);

        }


        //
        // SEND SCRIPT ====================================================
        //
        if (ns.hasRootAccess(server)) {
            if (await ns.scp(script, ns.getHostname(), server)) {
                //ns.tprint(`SUCCESS: Sent script '${script}' to server '${server}'`);
            } else {
                ns.tprint(`FAILED: to send script '${script}' to server '${server}'`)
            }
        }

        //
        // ENABLE SCRIPT ==================================
        //

        if (ns.scriptRunning(script, server)) {
            //ns.tprint(`SKIPPED: ${server}, found ${script}`)
            continue;
        }

        var used = ns.getServerUsedRam(server);
        var max = ns.getServerMaxRam(server);
        //ns.tprint(`${server} is opened. ${used} GB / ${max} GB (${(100 * used / max).toFixed(2)}%)`)

        var threads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / ns.getScriptRam(script));
        if (threads == 0) {
            threads = 1;
        }

        if (!script_args) {
            script_args = server
        }


        if (ns.exec(script, server, threads, script_args) != 0) {
            ns.tprint(`LAUNCHED: '${script}' on server '${server}' with ${threads} threads and the following arguments: ${server}`);
            used = ns.getServerUsedRam(server);
            max = ns.getServerMaxRam(server);
            ns.tprint(`'${script}' on '${server}' is running. ${used} GB / ${max} GB (${(100 * used / max).toFixed(2)}%)`)
            j++;
        } else {
            ns.tprint(`FAILED: start script on ${server}`);
        }


    }

    ns.tprint(`===================================`);
    ns.tprint(`COMPLETE: ${i} servers checked. ${j} new scripts started.`);
}
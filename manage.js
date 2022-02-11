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

function threadcalc(ns, server, script) {
    var threads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / ns.getScriptRam(script));

    if (threads === 0) {
        //ns.tprint(`Threadcounter failed, gave ${threads}, assigning 1 thread`)
        //ns.tprint(`Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / ns.getScriptRam(script))`)
        //ns.tprint(`${ns.getServerMaxRam(server)} - ${ns.getServerUsedRam(server)} / ${ns.getScriptRam(script)}`)
        threads = 1
    }

    return threads;
}

function portcracks(ns) {
    var numPortsAvail = 0
    if (ns.fileExists("BruteSSH.exe", "home")) { numPortsAvail++ }
    if (ns.fileExists("FTPCrack.exe", "home")) { numPortsAvail++ }
    if (ns.fileExists("relaySMTP.exe", "home")) { numPortsAvail++ }
    if (ns.fileExists("HTTPWorm.exe", "home")) { numPortsAvail++ }
    if (ns.fileExists("SQLInject.exe", "home")) { numPortsAvail++ }
    return numPortsAvail
}

function freememcheck(ns, server) {
    var used = ns.getServerUsedRam(server);
    var max = ns.getServerMaxRam(server);
    ns.tprint(`${used} GB / ${max} GB (${(100 * used / max).toFixed(2)}%)`)
    return;
}

export function list_servers(ns) {
    const list = [];
    scan(ns, '', 'home', list);
    return list;
}

/** @param {NS} ns **/
export async function main(ns) {
    //FLAGS
    //


    const args = ns.flags([["help", false], ["restart", false], ["minram", 0], ["filter", /.*/], ["args", ""], ["debug", false],
    ["script", "starter.script"], ["dummy", false], ["pserv", false], ["clear", false], ["remove", false]])
    if (args.help) {
        ns.tprint("This script roots any server that has a low enough minHackLevel and minPortsOpen requirements. Pass script as an argument to transmit to rooted machines.")
        ns.tprint(`Usage: run ${ns.getScriptName()} script script_arguments`)
        ns.tprint("script will hack its host server if no script_arguments are given.")
        ns.tprint("--restart to reload all scripts with new options")
        ns.tprint("--clear - Kills all scripts on all machines except home")
        ns.tprint("--filter [string] to filter out non-matching servers")
        ns.tprint("--minram [1-2-4-8-16-32...] filters out servers that are below that amount of RAM")
        ns.tprint("--args [string] filters servers that are below ")
        ns.tprint("--debug turns on debugging text ")
        ns.tprint("--pserv manages pservs, default is 'target.script' ")
        ns.tprint("--remove manages pservs, default is 'target.script' ")

        return;
    }
    if (args.debug) { ns.tprint(`debug-info flags: restart=${args.restart}  --filter:${args.filter}  --minram:${args.minram}  --debug:${args.debug}`) }
    if (args.debug) { ns.tprint(`debug-info args: script=${args.script}  --args:${args.args} --dummy:${args.dummy}`) }




    var i = 0
    var j = 0


    var script = args.script
    if (args.pserv) {
        script = "target.script"
    }

    let script_args = args.args

    // if --pservs is activated insert a regex for a new line to negate the filter, otherwise pservs are filtered out.

    var pservblocker = new RegExp(/pserv.*/)
    if (args.pserv) {
        pservblocker = new RegExp(/^(?!pserv.*)/)
    }

    let homeblocker = new RegExp(/home/)
    let filter = new RegExp(args.filter, '')



    if (args.debug) {
        ns.tprint(`variable script=${script}`)
        ns.tprint(`variable script_args=${script_args}`)
        ns.tprint(`variable pservblocker=${pservblocker}`)
        ns.tprint(`variable homeblocker=${homeblocker}`)
        ns.tprint(`variable filter=${filter}`)
    }

    // counts the number of ports i can crack
    var numPortsAvail = portcracks(ns)



    const servers = list_servers(ns).filter(s => ns.getServerRequiredHackingLevel(s) <= ns.getHackingLevel()
        && filter.test(s) && !homeblocker.test(s) && !pservblocker.test(s) && ns.getServerMaxRam(s) > args.minram);


    if (args.debug) {
        ns.tprint(`--============ AVAILABLE SERVER LIST ==============--`)
        for (const server of servers) {
            ns.tprint(`${server}`)
        }

    }
    //
    //  KILLS ALL SCRIPTS ON ALL LISTED SERVERS
    //

    if (args.clear) {
        for (const server of servers) {
            ns.killall(server)
            ns.tprint(`${server} cleared`)
        }
        return;
    }


    //
    // REMOVES A PURCHASED SERVER THAT DOES NOT HAVE SCRIPTS RUNNING 
    //
    if (args.remove) {

        for (const server of servers) {
            if (args.dummy == false) {
                ns.deleteServer(server)
                ns.tprint(`${server} removed`)

            } else {
                ns.tprint(`DUMMY MODE: ${server} not deleted`)
            }


        }
        return;
    }

    for (const server of servers) {

        i++; // count servers

        //
        // SPOOF PORTS AND ROOT SERVERS ================
        //
        if (args.debug) { ns.tprint(`--==============================--`) }



        if (ns.getServerNumPortsRequired(server) <= numPortsAvail && !ns.hasRootAccess(server)) {

            if (ns.fileExists("BruteSSH.exe", "home")) {
                if (await ns.brutessh(server)) {
                    if (args.debug) { ns.tprint(`${server} is brute forced.`) }
                }
            }
            if (ns.fileExists("FTPCrack.exe", "home")) {
                if (await ns.ftpcrack(server)) {
                    if (args.debug) { ns.tprint(`${server} is cracked.`) }
                }
            }
            if (ns.fileExists("relaySMTP.exe", "home")) {
                if (await ns.relaysmtp(server)) {
                    if (args.debug) { ns.tprint(`${server} is relayed.`) }
                }
            }
            if (ns.fileExists("HTTPWorm.exe", "home")) {
                if (await ns.httpworm(server)) {
                    if (args.debug) { ns.tprint(`${server} is wormed.`) }
                }
            }
            if (ns.fileExists("SQLInject.exe", "home")) {
                if (await ns.sqlinject(server)) {
                    if (args.debug) { ns.tprint(`${server} is injected.`) }
                }
            }

            if (args.debug) { ns.tprint(`nuking ${server}`) }
            await ns.nuke(server)
            if (args.debug) { ns.tprint(`${server} is rooted.`) }

        } else {
            if (args.debug) { ns.tprint(`${server} is already rooted or not enough ports are available. ${ns.getServerNumPortsRequired(server)} needed, have ${numPortsAvail}`) }
        }


        //
        // LOAD SCRIPT 
        //
        if (!args.dummy) {
            if (ns.hasRootAccess(server)) {
                if (await ns.scp(script, ns.getHostname(), server)) {

                    if (args.debug) { ns.tprint(`SUCCESS: Sent script '${script}' to server '${server}'`) }

                } else {
                    if (args.debug) { ns.tprint(`FAILED: to send script '${script}' to server '${server}'`) }
                }
            }
        }
        if (ns.scriptRunning(script, server)) {
            if (args.debug) { ns.tprint(`FOUND: '${script}' is already running on '${server}'.`) }


        }
        //
        // ACTIVATE SCRIPT 
        //
        if (args.restart) {
            if (!args.dummy) {
                ns.killall(server)
                if (args.debug) { ns.tprint(`Scripts killed on ${server}`) }
                if (args.debug) { freememcheck(ns, server) }
            } else {
                ns.tprint(`DUMMY MODE: Script loader - no changes made to ${server}`)
            }

        } else {
            if (args.debug) { ns.tprint(`SKIPPED: '${script}' is already running on '${server}'.`) }
            if (args.debug) { freememcheck(ns, server) }
            continue;
        }

        // look for the script on the server and if restart is enabled, kill all scripts



        // calculate the max number of threads to use the most ram possible
        var threads = threadcalc(ns, server, script)


        //ns.tprint(`debug: ${script} :: ${script_args} :: `)

        // launch the script on the remote machine
        if (args.dummy == false) {
            if (ns.exec(script, server, threads, script_args)) {
                ns.tprint(`SUCCESS: '${script}' on server '${server}' with ${threads} threads and the following arguments: ${script_args}`);
                if (args.debug) { freememcheck(ns, server) }
                j++;
            } else {
                if (args.debug) { ns.tprint(`FAILED: start script on ${server}`) }
            }
        } else {
            ns.tprint(`DUMMY MODE: Script launcher - no changes made to ${server}`)
        }

    }


    if (args.debug) { ns.tprint(`--===================================--`) }
    if (j > 0) { ns.tprint(`COMPLETE: ${i} servers checked. ${j} new scripts started.`) }
}
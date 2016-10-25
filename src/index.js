const EXCEPTION_PATTERN = /([\w\d\.]*exception)\:\s*(.*)$/i;
const LINE_PATTERN = /((([\d\w]*\.)*[\d\w]*)\.)?([\d\w\$]*)\.([\d\w\$]*)\(([\d\w\.\s]*)(\:(\d*))?\)/;

export class StackPackage {
    constructor(name, aliases = [], isVendor = false) {
        if (!name || name.trim().length === 0) {
            throw new Error('Cannot create stack package: name is not defined');
        }
        if (!aliases || !(aliases instanceof Array)) {
            throw new Error('Cannot create stack package: aliases is not defined or of a wrong type');
        }
        this.name = name;
        this.aliases = aliases;
        this.isVendor = isVendor;
        if (!String.prototype.startsWith) {
            String.prototype.startsWith = function (search) {
                return this.indexOf(search) === 0;
            };
        }
    }

    equals(stackPackage) {
        if (!stackPackage) {
            return false;
        }
        if (stackPackage.name === this.name) {
            return true;
        }
        for (let i = 0; i < this.aliases.length; i++) {
            if (this.aliases[i] === stackPackage.name || stackPackage.name.startsWith(this.aliases[i])) {
                return true;
            }
        }
        return false;
    }
}

export class StackLine {
    constructor(stackPackage, javaClass, method, source, line) {
        if (!stackPackage || !(stackPackage instanceof StackPackage)) {
            throw new Error('Cannot create stack line: stack package is null or of a wrong type');
        }
        this.stackPackage = stackPackage;
        this.javaClass = javaClass || 'Unknown';
        this.method = method || 'Unknown';
        this.source = source || 'Unknown';
        this.line = line ? parseInt(line, 10) : -1;
    }
}

export class StackGroup {
    constructor(stackPackage) {
        if (!stackPackage || !(stackPackage instanceof StackPackage)) {
            throw new Error('Cannot create stack group: stack package is null or of a wrong type');
        }
        this.stackPackage = stackPackage;
        this.lines = [];
    }

    addLine(stackLine) {
        if (stackLine instanceof StackLine) {
            this.lines.push(stackLine);
        }
    }

    addException(exception, message) {
        this.exception = {
            exception: exception,
            message: message
        };
    }
}

export class Stack {
    constructor(opts = {}) {
        this.groups = [];
        this.vendorPackages = [];

        for (let key of Object.keys(opts)) {
            this.vendorPackages.push(new StackPackage(key, opts[key], true));
        }
    }

    parse(stackTrace) {
        this.groups = [];

        let parsedException = null;
        let lines = stackTrace.split('\n');
        lines.forEach((line)=> {
            if (parsedException === null) {
                parsedException = line.trim().match(EXCEPTION_PATTERN);
            }

            let parsedLine = line.trim().match(LINE_PATTERN);

            if (parsedLine !== null) {
                let stackPackage = new StackPackage(parsedLine[2] || 'Unknown');
                for (let index in this.vendorPackages) {
                    if (this.vendorPackages[index].equals(stackPackage)) {
                        stackPackage = this.vendorPackages[index];
                        break;
                    }
                }

                let stackLine = new StackLine(
                    stackPackage,
                    parsedLine[4],
                    parsedLine[5],
                    parsedLine[6],
                    parsedLine[8]
                );

                if (this.groups.length === 0) {
                    this.groups.push(new StackGroup(stackPackage));
                }

                let group = this.groups[this.groups.length - 1];
                if (!group.stackPackage.equals(stackPackage)) {
                    group = new StackGroup(stackPackage);
                    this.groups.push(group);
                }

                group.addLine(stackLine);
                if (parsedException !== null) {
                    group.addException(parsedException[1], parsedException[2]);
                    parsedException = null;
                }
            }
        });
    }
}

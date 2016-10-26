import { StackPackage, StackLine, StackGroup, Stack } from './index';
import { expect } from 'chai';

describe('StackPackage', ()=> {
    describe('throws error if', ()=> {
        it('name is undefined', ()=> {
            expect(()=> {
                new StackPackage();
            }).to.throw(Error);
        });
        it('name is null', ()=> {
            expect(()=> {
                new StackPackage(null);
            }).to.throw(Error);
        });
        it('name is empty', ()=> {
            expect(()=> {
                new StackPackage(null);
            }).to.throw(Error);
        });
        it('aliases is null', ()=> {
            expect(()=> {
                new StackPackage('test', null);
            }).to.throw(Error);
        });
        it('aliases if not an array', ()=> {
            expect(()=> {
                new StackPackage('test', {});
            }).to.throw(Error);
        });
    });
    it('adds startsWith to String.prototype', ()=> {
        // ES6 has the method, ES5 does not
        if (String.prototype.startsWith) {
            String.prototype.startsWith = undefined;
        }
        expect(String.prototype.startsWith).to.be.undefined;
        new StackPackage('test');
        expect(String.prototype.startsWith).to.exist;
    });
    describe('.equals()', ()=> {
        describe('returns false if', ()=> {
            it('package is undefined', ()=> {
                let package1 = new StackPackage('test', ['foo', 'bar']);
                expect(package1.equals()).to.be.false;
            });
            it('package is null', ()=> {
                let package1 = new StackPackage('test', ['foo', 'bar']);
                expect(package1.equals(null)).to.be.false;
            });
            it('name is not one of the alias', ()=> {
                let package1 = new StackPackage('test', ['hello', 'world']);
                let package2 = new StackPackage('foo', ['hello', 'world']);
                expect(package1.equals(package2)).to.be.false;
            });
            it('name is not one of the alias', ()=> {
                let package1 = new StackPackage('test', ['bar.foo', 'world']);
                let package2 = new StackPackage('foo', ['hello', 'world']);
                expect(package1.equals(package2)).to.be.false;
            });
        });
        describe('returns true if', ()=> {
            it('both names are the same', ()=> {
                let package1 = new StackPackage('test', ['foo', 'bar']);
                let package2 = new StackPackage('test', ['hello', 'world']);
                expect(package1.equals(package2)).to.be.true;
                expect(package2.equals(package1)).to.be.true;
            });
            it('name is one of the aliases', ()=> {
                let package1 = new StackPackage('test', ['foo', 'bar']);
                let package2 = new StackPackage('foo', ['hello', 'world']);
                expect(package1.equals(package2)).to.be.true;
                expect(package2.equals(package1)).to.be.false;
            });
            it('name is starts with of the aliases', ()=> {
                let package1 = new StackPackage('test', ['foo', 'bar']);
                let package2 = new StackPackage('foo.bar', ['hello', 'world']);
                expect(package1.equals(package2)).to.be.true;
                expect(package2.equals(package1)).to.be.false;
            });
        });
    });
});

describe('StackLine', ()=> {
    describe('throws error if', ()=> {
        it('stack package is undefined', ()=> {
            expect(()=> {
                new StackLine();
            }).to.throw(Error);
        });
        it('stack package is null', ()=> {
            expect(()=> {
                new StackLine(null)
            }).to.throw(Error);
        });
        it('stack package is not of type StackPackage', ()=> {
            expect(()=> {
                new StackPackage({})
            }).to.throw(Error);
        });
    });
    it('sets default for class, method, source and line number', ()=> {
        let stackPackage = new StackPackage('test');
        let stackLine = new StackLine(stackPackage);
        expect(stackLine.stackPackage).to.equal(stackPackage);
        expect(stackLine.javaClass).to.equal('Unknown');
        expect(stackLine.method).to.equal('Unknown');
        expect(stackLine.source).to.equal('Unknown');
        expect(stackLine.line).to.equal(-1);
    });
});

describe('StackGroup', ()=> {
    describe('throws error if', ()=> {
        it('stack package is undefined', ()=> {
            expect(()=> {
                new StackGroup();
            }).to.throw(Error);
        });
        it('stack package is null', ()=> {
            expect(()=> {
                new StackGroup(null)
            }).to.throw(Error);
        });
        it('stack package is not of type StackPackage', ()=> {
            expect(()=> {
                new StackGroup({})
            }).to.throw(Error);
        });
    });
    describe('adds lines', ()=> {
        let stackPackage;
        let stackGroup;

        beforeEach(()=> {
            stackPackage = new StackPackage('test');
            stackGroup = new StackGroup(stackPackage);
        });
        it('as expected', ()=> {
            let numLines = 10;
            for (let i = 0; i < numLines; i++) {
                stackGroup.addLine(new StackLine(stackPackage));
            }
            expect(stackGroup.lines.length).to.equal(numLines);
        });
        it('only if typeof StackLine', ()=> {
            stackGroup.addLine({});
            expect(stackGroup.lines.length).to.equal(0);
        });
    });
    describe('adds exception', ()=> {
        let stackPackage;
        let stackGroup;

        beforeEach(()=> {
            stackPackage = new StackPackage('test');
            stackGroup = new StackGroup(stackPackage);
            stackGroup.addException('my.exception', 'This is an error message');
        });
        it('as expected', ()=> {
            expect(stackGroup.exception).to.exist;
            expect(stackGroup.exception.exception).to.equal('my.exception');
            expect(stackGroup.exception.message).to.equal('This is an error message');
        });
        it('and overrides the previously defined', ()=> {
            stackGroup.addException('my.new.exception', 'This is a new error message');
            expect(stackGroup.exception).to.exist;
            expect(stackGroup.exception.exception).to.equal('my.new.exception');
            expect(stackGroup.exception.message).to.equal('This is a new error message');
        });
    });
});

describe('Stack', ()=> {
    it('has no vendor packages by default', ()=> {
        let stack = new Stack();
        expect(stack.vendorPackages.length).to.equal(0);
    });
    it('can add vendor packages', ()=> {
        let opts = {
            'aaa': ['foo', 'bar'],
            'bbb': ['hello', 'world']
        };
        let stack = new Stack(opts);
        expect(stack.vendorPackages.length).to.equal(Object.keys(opts).length);
        stack.vendorPackages.forEach((vendorPackage, index)=> {
            expect(Object.keys(opts).indexOf(vendorPackage.name)).to.equal(index);
            expect(vendorPackage.aliases).to.equal(opts[vendorPackage.name]);
        })
    });
    describe('can parse', ()=> {
        let stackTrace = [
            'java.net.SocketException: Connection reset',
            'at java.net.SocketInputStream.read(SocketInputStream.java:185)',
            'at sun.security.ssl.InputRecord.readFully(InputRecord.java:312)',
            'at sun.security.ssl.InputRecord.read(InputRecord.java:350)',
            'at org.apache.http.impl.io.AbstractSessionInputBuffer.fillBuffer(AbstractSessionInputBuffer.java:166)',
            'at org.apache.http.impl.conn.DefaultHttpResponseParser.parseHead(DefaultHttpResponseParser.java:92)',
            'at org.apache.http.protocol.HttpRequestExecutor.doReceiveResponse(HttpRequestExecutor.java:300)',
            'at org.apache.http.protocol.HttpRequestExecutor.execute(HttpRequestExecutor.java:127)',
            'at com.sparktale.bugtale.server.common.aws.S3Manager.doPutObject(S3Manager.java:247)',
            'at com.sparktale.bugtale.server.common.aws.S3Manager.putBytes(S3Manager.java:134)',
            'at com.sparktale.bugtale.server.common.util.S3IOInterface.putBytes(S3IOInterface.java:84)',
            'at com.sparktale.bugtale.server.common.util.IOUtil.putBytes(IOUtil.java:126)',
            'Caused by: org.hibernate.exception.ConstraintViolationException: could not insert: [com.example.myproject.MyEntity]',
            'at org.hibernate.exception.SQLStateConverter.convert(SQLStateConverter.java:96)',
            'at org.hibernate.id.insert.AbstractSelectingDelegate.performInsert(AbstractSelectingDelegate.java:64)',
            'at org.hibernate.persister.entity.AbstractEntityPersister.insert(AbstractEntityPersister.java:2329)',
            'at org.hibernate.persister.entity.AbstractEntityPersister.insert(AbstractEntityPersister.java:2822)',
            'at sun.reflect.GeneratedMethodAccessor5.invoke(Unknown Source)',
            'at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:25)',
            'at $Proxy19.save(Unknown Source)',
            'at com.example.myproject.MyEntityService.save(MyEntityService.java:59) <-- relevant call (see notes below)',
            'at com.example.myproject.MyServlet.doPost(MyServlet.java:164)',
            '... 32 more',
            'Caused by: java.sql.SQLException: Violation of unique constraint MY_ENTITY_UK_1: duplicate value(s) for column(s) MY_COLUMN in statement [...]',
            'at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1110)',
            'at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:603)',
            'at java.lang.Thread.run(Thread.java:679)'
        ].join('\r\n');

        it('without vendor packages', ()=> {
            let stack = new Stack();
            stack.parse(stackTrace);

            expect(stack.groups.length).to.equal(15);

            expect(stack.groups[0].exception).to.exist;
            expect(stack.groups[0].exception.exception).to.equal('java.net.SocketException');
            expect(stack.groups[0].exception.message).to.equal('Connection reset');
            expect(stack.groups[0].stackPackage.name).to.equal('java.net');
            expect(stack.groups[0].lines.length).to.equal(1);
            expect(stack.groups[1].exception).to.not.exist;
            expect(stack.groups[1].stackPackage.name).to.equal('sun.security.ssl');
            expect(stack.groups[1].lines.length).to.equal(2);
            expect(stack.groups[2].exception).to.not.exist;
            expect(stack.groups[2].stackPackage.name).to.equal('org.apache.http.impl.io');
            expect(stack.groups[2].lines.length).to.equal(1);
            expect(stack.groups[3].exception).to.not.exist;
            expect(stack.groups[3].stackPackage.name).to.equal('org.apache.http.impl.conn');
            expect(stack.groups[3].lines.length).to.equal(1);
            expect(stack.groups[4].exception).to.not.exist;
            expect(stack.groups[4].stackPackage.name).to.equal('org.apache.http.protocol');
            expect(stack.groups[4].lines.length).to.equal(2);
            expect(stack.groups[5].exception).to.not.exist;
            expect(stack.groups[5].stackPackage.name).to.equal('com.sparktale.bugtale.server.common.aws');
            expect(stack.groups[5].lines.length).to.equal(2);
            expect(stack.groups[6].exception).to.not.exist;
            expect(stack.groups[6].stackPackage.name).to.equal('com.sparktale.bugtale.server.common.util');
            expect(stack.groups[6].lines.length).to.equal(2);
            expect(stack.groups[7].exception).to.exist;
            expect(stack.groups[7].exception.exception).to.equal('org.hibernate.exception.ConstraintViolationException');
            expect(stack.groups[7].exception.message).to.equal('could not insert: [com.example.myproject.MyEntity]');
            expect(stack.groups[7].stackPackage.name).to.equal('org.hibernate.exception');
            expect(stack.groups[7].lines.length).to.equal(1);
            expect(stack.groups[8].exception).to.not.exist;
            expect(stack.groups[8].stackPackage.name).to.equal('org.hibernate.id.insert');
            expect(stack.groups[8].lines.length).to.equal(1);
            expect(stack.groups[9].exception).to.not.exist;
            expect(stack.groups[9].stackPackage.name).to.equal('org.hibernate.persister.entity');
            expect(stack.groups[9].lines.length).to.equal(2);
            expect(stack.groups[10].exception).to.not.exist;
            expect(stack.groups[10].stackPackage.name).to.equal('sun.reflect');
            expect(stack.groups[10].lines.length).to.equal(2);
            expect(stack.groups[11].exception).to.not.exist;
            expect(stack.groups[11].stackPackage.name).to.equal('Unknown');
            expect(stack.groups[11].lines.length).to.equal(1);
            expect(stack.groups[12].exception).to.not.exist;
            expect(stack.groups[12].stackPackage.name).to.equal('com.example.myproject');
            expect(stack.groups[12].lines.length).to.equal(2);
            expect(stack.groups[13].exception).to.exist;
            expect(stack.groups[13].exception.exception).to.equal('java.sql.SQLException');
            expect(stack.groups[13].exception.message).to.equal('Violation of unique constraint MY_ENTITY_UK_1: duplicate value(s) for column(s) MY_COLUMN in statement [...]');
            expect(stack.groups[13].stackPackage.name).to.equal('java.util.concurrent');
            expect(stack.groups[13].lines.length).to.equal(2);
            expect(stack.groups[14].exception).to.not.exist;
            expect(stack.groups[14].stackPackage.name).to.equal('java.lang');
            expect(stack.groups[14].lines.length).to.equal(1);
        });
        it('with vendor packages', ()=> {
            let stack = new Stack({
                'Java/Sun/Oracle': ['java', 'javax', 'sun', 'sunw', 'com.sun', 'com.oracle'],
                'Apache': ['org.apache'],
                'Hibernate': ['org.hibernate']
            });
            stack.parse(stackTrace);

            expect(stack.groups.length).to.equal(9);

            expect(stack.groups[0].exception).to.exist;
            expect(stack.groups[0].exception.exception).to.equal('java.net.SocketException');
            expect(stack.groups[0].exception.message).to.equal('Connection reset');
            expect(stack.groups[0].stackPackage.name).to.equal('Java/Sun/Oracle');
            expect(stack.groups[0].lines.length).to.equal(3);
            expect(stack.groups[1].exception).to.not.exist;
            expect(stack.groups[1].stackPackage.name).to.equal('Apache');
            expect(stack.groups[1].lines.length).to.equal(4);
            expect(stack.groups[2].exception).to.not.exist;
            expect(stack.groups[2].stackPackage.name).to.equal('com.sparktale.bugtale.server.common.aws');
            expect(stack.groups[2].lines.length).to.equal(2);
            expect(stack.groups[3].exception).to.not.exist;
            expect(stack.groups[3].stackPackage.name).to.equal('com.sparktale.bugtale.server.common.util');
            expect(stack.groups[3].lines.length).to.equal(2);
            expect(stack.groups[4].exception).to.exist;
            expect(stack.groups[4].exception.exception).to.equal('org.hibernate.exception.ConstraintViolationException');
            expect(stack.groups[4].exception.message).to.equal('could not insert: [com.example.myproject.MyEntity]');
            expect(stack.groups[4].stackPackage.name).to.equal('Hibernate');
            expect(stack.groups[4].lines.length).to.equal(4);
            expect(stack.groups[5].exception).to.not.exist;
            expect(stack.groups[5].stackPackage.name).to.equal('Java/Sun/Oracle');
            expect(stack.groups[5].lines.length).to.equal(2);
            expect(stack.groups[6].exception).to.not.exist;
            expect(stack.groups[6].stackPackage.name).to.equal('Unknown');
            expect(stack.groups[6].lines.length).to.equal(1);
            expect(stack.groups[7].exception).to.not.exist;
            expect(stack.groups[7].stackPackage.name).to.equal('com.example.myproject');
            expect(stack.groups[7].lines.length).to.equal(2);
            expect(stack.groups[8].exception).to.exist;
            expect(stack.groups[8].exception.exception).to.equal('java.sql.SQLException');
            expect(stack.groups[8].exception.message).to.equal('Violation of unique constraint MY_ENTITY_UK_1: duplicate value(s) for column(s) MY_COLUMN in statement [...]');
            expect(stack.groups[8].stackPackage.name).to.equal('Java/Sun/Oracle');
            expect(stack.groups[8].lines.length).to.equal(3);
        });
    });
});
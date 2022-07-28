const { expect, test } = require('@oclif/test');
const cmd = require('..');

describe('rps-rescheduler', () => {
  let stdout;
  
  beforeEach(() => {
    stdout = test.stdout();
  });

  afterEach(() => {
    stdout = null;
  });

  stdout.do(() => cmd.run(['-e', 'test']))
    .it('runs command with -e flag', ctx => {
      expect(ctx.stdout).to.contain('');
    });
  
  stdout.do(() => cmd.run(['-e', 'data']))
    .it('runs the command with wrong -e flag', ctx => {
      expect(ctx.stdout).to.contain('');
    });

  stdout.do(() => cmd.run([]))
    .it('runs command without -e flag', ctx => {
      expect(ctx.stdout).to.eql('Only test and prod are allowed as environments');
    });
});
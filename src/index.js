const { Command, flags } = require('@oclif/command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const environment = {
  test: {
    url: 'https://broker.test.cebroker.com/messages',
    token: 'Y2ViLWJvYYm9LXRlc3Rwd2QhcmQ6XJk=',
    flow: 'ROSTER_POSTING_ASYNC_TEST',
  },
  prod: {
    url: 'https://broker.cebroker.com/messages',
    token: 'XRlc3RY2ViLWJvYmQ6XJkYm9Lwd2Qhc=',
    flow: 'ROSTER_POSTING_ASYNC',
  },
};

class RpsReschedulerCommand extends Command {
  static flags = {
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    env: flags.string({
      char: 'e',
      description: 'environment',
      required: true,
      parse: (input) => input.toLowerCase(),
    }),
    file: flags.string({
      char: 'f',
      description: 'file with headerIds to process',
      default: 'data.json',
    }),
  };

  parseData(id, flow) {
    return {
      flow,
      messages: [
        {
          id: 1606923143062,
          eventId: 1606923143062,
          entityId: id,
          eventType: 'SCHEDULED',
          eventDate: new Date(),
          data: {
            header_id: id,
            sort_by: ['license.countryCode', 'license.stateCode', 'license.boardCode', 'license.professionCode'],
          },
        },
      ],
    };
  }

  async reschedule(id, { url, token, flow }) {
    try {
      const body = this.parseData(id, flow);

      const { data } = await axios.post(url, body, {
        headers: { Authorization: `Basic ${token}` },
      });

      this.log(JSON.stringify(data, null, 2));
    } catch (error) {
      this.error({ error: error.message, id });
    }
  }

  async run() {
    const { flags } = this.parse(RpsReschedulerCommand);

    if (Object.keys(environment).includes(flags.env)) {
      const env = environment[flags.env];
      let ids = [];

      try {
        const filepath = flags.file.includes(path.sep) ? flags.file : `.${path.sep}${flags.file}`;
        const file = fs.readFileSync(path.resolve(filepath), 'utf8');

        if (file.trim().length) {
          const parsed = JSON.parse(file);
          ids = Array.isArray(parsed) ? parsed : [];
        } else {
          return this.error('The file is empty');
        }
      } catch (error) {
        return this.error(`${flags.file} : The file was not found. Check the file path again`);
      }

      if (ids.length) {
        for (let id of ids) {
          await this.reschedule(id, env);
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        this.log('The reschedule process has ended');
      } else {
        this.log('No headers found to process');
      }
    } else {
      this.error('Only test and prod are allowed as environments');
    }
  }
}

module.exports = RpsReschedulerCommand;

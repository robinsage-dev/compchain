module.exports = function(Command)
{
    return Command('create user', {
        description: 'Create a user',
        pre: [],
        run: function(prompt) {
            const questions = [
                {
                    key: 'email',
                    text: 'email',
                    defaultValue: 'admin@fakedomain.com',
                    type: 'string',
                },
                {
                    key: 'name',
                    text: 'name',
                    type: 'string',
                    defaultValue: 'Default Administrator'
                },
                {
                    key: 'verified',
                    text: 'is verified?',
                    type: 'boolean',
                    defaultValue: true,
                },
                {
                    key: 'role',
                    text: 'role',
                    type: 'string',
                    defaultValue: 'Super Admin'
                },
                {
                    key: 'password',
                    text: 'password',
                    type: 'password',
                },
                {
                    key: 'confirm',
                    text: function(values) {
                        const {EOL} = require('os');
                        const useValues = Object.assign({}, values, {password: '<hidden>'});
                        const table = prompt.maketable(useValues);

                        return `Create a user with these details`;
                    },
                    type: 'boolean',
                    defaultValue: true,
                },
            ];

            prompt.info('Beginning process of generating a new user.');
            prompt.info('Press enter to use defaults in parentheses');

            this.ask(prompt, questions, (err, responses) =>
            {
                // console.log('ERR:', err, 'RESPONSES:', responses);
                if (err) {
                    prompt.error(err);
                    prompt.end(1);
                    return;
                }

                if (!responses.confirm) {
                    prompt.warn('You decided not to create it...');
                    prompt.feed(2);
                    prompt.end();
                    return;
                }

                const User = require_robinbase('app:model:User');
                const user = new User(responses);

                User.crud.create(user, (err, user) => {
                    if (err) {
                        prompt.error(err);
                    } else {
                        prompt.success(`User created successfully`);
                    }

                    prompt.feed(2);
                    prompt.end(err ? 1 : 0);
                });
            });
        }
    });
}

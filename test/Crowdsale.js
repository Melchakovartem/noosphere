const Crowdsale = artifacts.require('./Crowdsale')
const Token = artifacts.require('./Token')

contract('Crowdsale', function(accounts) {

	beforeEach('setup contract for each test', async function () {
        owner = accounts[0]
        crowdsale = await Crowdsale.new({from: owner})
        token_address = await crowdsale.token()
        token = await Token.at(token_address)
    })

    it('has an token', async function () {
    	console.log(token.address)
    	console.log(await crowdsale.token())
    })
})
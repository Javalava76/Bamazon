var mysql = require('mysql');
var Table = require('easy-table');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "kira",
	database: "bamazon"
});

connection.connect(function(err) {
	if (err) throw err;
	// console.log("connected as id " + connection.threadId);
	console.log("\n\n\n\nIT'S TIME TO SHOP BAMAZON!\n\n")
	productList();


});


function productList() {

	connection.query("SELECT * FROM products", function (err, result, fields) {
		if (err) throw err;

		var data = [];
		var table = new Table;

		for(var i = 0; i < result.length; i++) {

			data[i] = { 
				id: result[i].item_id, 
				name: result[i].product_name, 
				dept: result[i].department_name, 
				price: result[i].price, 
				quantity: result[i].quantity
			};

		};
		data.forEach(function(result) {
			table.cell("item_id", result.id);
			table.cell("product_name", result.name);
			table.cell("department_name", result.dept);
			table.cell("price", result.price, Table.number(2));
			table.cell("quantity", result.quantity);
			table.newRow();
		})
		console.log(table.toString());

		inquirerPrompt();
	});

}

function inquirerPrompt() {
	// console.log("inquirerPrompt");

	inquirer.prompt([{
            name: "item_id",
            type: "input",
            message: "What is the ID of the product you would like to buy?",
            validate: function(value) {
                return (value !== "") && (value.length === 2) && (value < 22);
            }
        }, {
            name: "amount",
            type: "input",
            message: "\nHow many would you like to buy?",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }

		]).then(function(answer) {
		// console.log(answer.item_id);
		// console.log(answer.amount);

		queryItem(answer.item_id, parseInt(answer.amount));
	})
}

function queryItem(item_id, amount) {
	// console.log(item_id);
	// console.log(amount);

	connection.query("SELECT * FROM products WHERE item_id=?", item_id, function (err, result, fields) {
		if (err) throw err;

		var name = result[0].product_name;
		var price = result[0].price;
		var total_cost = price * amount;

		if(amount <= result[0].quantity ) {
			var new_quantity = result[0].quantity - amount;
			// console.log(new_quantity);

			connection.query("UPDATE products SET quantity=? WHERE item_id=?", [new_quantity, item_id], function (err, res, fields) {
				if (err) throw err;

				console.log("\n\nYou have placed an order for " + amount + " " + name +"s");
				console.log("\nTotal cost of the order is $" + total_cost.toFixed(2) + "\n\n" );
				productList();

			});
		}
		else {
			console.log("\n\nError: Insufficient quantity. Please choose again.\n\n");
			productList();
		}

	});
}


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
	console.log("connected as id " + connection.threadId);
	printProductList();


});


function printProductList() {

	connection.query("SELECT * FROM products", function (err, result, fields) {
		if (err) throw err;

		var data = [];
		var t = new Table;

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
			t.cell("item_id", result.id);
			t.cell("product_name", result.name);
			t.cell("department_name", result.dept);
			t.cell("price", result.price, Table.number(2));
			t.cell("quantity", result.quantity);
			t.newRow();
		})
		console.log(t.toString());

		inquirerPrompt();
	});

}

function inquirerPrompt() {
	// console.log("inquirerPrompt");

	inquirer.prompt([
	{
		type: "input",
		name: "item_id",
		message: "Enter the ID number of the item you would like to buy:\n",
		validate: function(value) {
                if ((value.trim()=="") === false && isNaN(value) === false) {
                  return true;
                }
                return false;
              }
            },
    ]).then(function(value) {

    	if (value.item_id < 22 && value.item_id > -1) {

    	inquirer.prompt([

			{
			type: "input",
			name: "quantity",
			message: "How many would you like to purchase?"
			},
			]).then(function(res) {
		

		queryItem(res.item_id, parseInt(res.quantity));
		
	


		else {

		console.log("Invalid Product ID");
		inquirerPrompt();
		}

	});

}





function queryItem(item_id, quantity) {
	// console.log(item_id);
	// console.log(quantity);

	connection.query("SELECT * FROM products WHERE item_id=?", item_id, function (err, result, fields) {
		if (err) throw err;

		var name = result[0].product_name;
		var price = result[0].price;
		var total_cost = price * quantity;

		if(quantity <= result[0].quantity ) {
			var new_quantity = result[0].quantity - quantity;
			// console.log(new_quantity);

			connection.query("UPDATE products SET quantity=? WHERE item_id=?", [new_quantity, item_id], function (err, res, fields) {
				if (err) throw err;

				console.log("\nYou have ordered " + quantity + " " + name + "s.");
				console.log("Total cost of the order is $" + total_cost.toFixed(2) + "\n\n" );
				printProductList();

			});
		}
		else {
			console.log("\n\nError: insufficient quantity.\n\n");
			printProductList();
		}

	});
}

// printProductList(inquirerPrompt);
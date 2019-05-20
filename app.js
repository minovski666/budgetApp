var budgetController = (function(){

     var Expense = function(id, desc, value){
        this.id = id;
        this.desc = desc;
        this.value = value;
        this.percetage = -1;
     };

     Expense.prototype.calcPercentage = function(totalInc){

        if(totalInc > 0){
            this.percetage = Math.round((this.value / totalInc) * 100);
        }else{
            this.percetage = -1;
        }
     };

     Expense.prototype.getPercentage = function(){
        return this.percetage;
     };

     var Income = function(id, desc, value){
        this.id = id;
        this.desc = desc;
        this.value = value;
     };

     var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
     }

     var data = {
         allItems: {
             exp:[],
             inc:[]
         },
         totals: {
             exp:0,
             inc:0
         },
         budget: 0,
         percetage: -1
     };

     return {
         addItem: function(type, des, val){
            var newItem, ID;

            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            
            if (type === 'exp'){
                newItem = new Expense(ID, des, val);
            }else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;

         },

         deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1){
                data.allItems[type].splice(index, 1);
            }

         },
         testing:function(){
             console.log(data);
         },

         calculateBudget: function(){
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0){
                data.percetage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else {
                data.percetage = -1;
            }
         },

         calculatePercentages: function(){

            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });

         },

         getPercentages: function(){

            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
         },

         getBudget: function(){
             return {
                 budget: data.budget,
                 totalInc: data.totals.inc,
                 totalExp: data.totals.exp,
                 percetage: data.percetage
             };
         }
     };

})();


var UIController = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function(num, type){
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }

        dec = numSplit[1];

        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;

    };

    var NodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput: function(){
            return {
                type:document.querySelector(DOMstrings.inputType).value,
                description:document.querySelector(DOMstrings.inputDesc).value,
                value:parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
            
        },

        addListItem: function(obj, type){
            var html, newHtml, element;

            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if (type === 'exp'){
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%desc%', obj.desc);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


        },

        deleteListItem:function(selectorID){

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields: function(){
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array){

                current.value = "";

            });

            fieldsArray[0].focus();

        },

        displayBudget: function(obj){

            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percetage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percetage + '%';
            }else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages){

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            

            NodeListForEach(fields, function(current, index){

                if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else {
                    current.textContent = '---';
                }
            });

        },

        displayMonth: function(){
 
            var now, year, month, months;
            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        changeType: function(){

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDesc + ',' +
                DOMstrings.inputValue);

                NodeListForEach(fields, function(cur){
                    cur.classList.toggle('red-focus');
                });

                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMstrings: function(){
            return DOMstrings;
        }
    };

})();


var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    var updateBudget = function(){

        budgetCtrl.calculateBudget();

        var budget = budgetCtrl.getBudget();

        UICtrl.displayBudget(budget);
        
    };

    var updatePercentages = function(){

        budgetCtrl.calculatePercentages();

        var percentages = budgetCtrl.getPercentages();

        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function(){
        var input,newItem;
        
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0){

            newItem = budgetController.addItem(input.type, input.description, input.value);

            UICtrl.addListItem(newItem, input.type);

            UICtrl.clearFields();

            updateBudget();

            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event){
        var itemId, splitId, type, ID;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId){

            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);

            budgetCtrl.deleteItem(type,ID);

            UICtrl.deleteListItem(itemId);

            updateBudget();

            updatePercentages();

        }

    };

    return {
        init: function(){
            console.log("app start");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percetage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();



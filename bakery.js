//The utilities will store the function for generating new object ids, otherwise it will be made global
let utils = (function() {
    let ids = 0;
    function getNewId() {
        return ids++;
    }

    return { getNewId };
})();

// Cake Model
class Cake {
    constructor(id, flavor, frosting, layers, shapes) {
        this.id = id;
        this.flavor = flavor;
        this.frosting = frosting;
        this.layers = layers;
        this.shapes = shapes;
    }
}

// New Order Model
class Order {
    constructor(id, name, baker, eventDate) {
        this.id = id;
        this.name = name;
        this.baker = baker;
        this.eventDate = eventDate;
        this.cakes = [];
    }

    // Add new cake function
    addCake(flavor, frosting, layers, shapes) {
        this.cakes.push(new Cake(utils.getNewId(), flavor, frosting, layers, shapes));
    }

    // Remove cake function 
    removeCake(id) {
        let cakeToDeleteIdx = this.cakes.map(cake => cake.id).indexOf(id);
        if (cakeToDeleteIdx != -1) {
            this.cakes.splice(cakeToDeleteIdx, 1);
        }
    }
}

//Where our orders will be stored
let orderRepo = [];


class OrderService {
    
    // Returns the index in the repo where an order with given id was found; -1 if not found
    static getIdxForId(orderId) {
        
        return orderRepo.map(a => a.id).indexOf(orderId);
    }

    static getAllOrders() {
        return orderRepo;
    }

    static addOrder(order) {
        orderRepo.push(order);
    }
    //We update the order by first locating it in the orderRepo
    static updateOrder(order) {
        let indexToUpdate = OrderService.getIdxForId(order.id);
        if (indexToUpdate != -1) {
            orderRepo[indexToUpdate] = order;
        }
    }

    static deleteOrder(id) {
        let indexToUpdate = OrderService.getIdxForId(id);
        orderRepo.splice(indexToUpdate, 1);
    }

    static deleteCake(orderId, cakeId) {
        
        let indexToUpdate = OrderService.getIdxForId(orderId);
        let orderToUpdate = orderRepo[indexToUpdate];
        orderToUpdate.removeCake(cakeId);
    }
}

//Frontend state

let currentState;   

function updateState(newState) {
    //The new state is rendered in real-time
    currentState = newState;
    DOMManager.render();
}

//DOM Manager
class DOMManager {
    static getOrderHeader(orderDesc) {
        return `<div>
                        <div class="col-8">
                        <h4><span>Order Name:</span> <small class="text-muted">${orderDesc.name}</small><br>
                        <span>Baked by :</span> <small class="text-muted">${orderDesc.baker}</small><br>
                        <span>Event Date:</span> <small class="text-muted">${orderDesc.eventDate}</small></h4>
                        </div>
                        <div class="col-4">
                            <button class="delete-order btn btn-danger" 
                            id="delete-order-${orderDesc.id}" data-order-id="${orderDesc.id}">Delete</button>
                        </div>
                    </div>
                </div>`
    }
    //We render the orders on the DOM programmatically with template literals + HTML by looping through each cake object in the order array
    static getCakeMarkupForOrder(orderDesc) {
        let cakeHtml = [];
        orderDesc.cakes.forEach(cakeDesc => {
            cakeHtml.push(`<div class="row">
                <div class="col-8">
                    <ul>
                      <li><b>Flavor:</b> ${cakeDesc.flavor}</li>
                      <li><b>Frosting:</b> ${cakeDesc.frosting}</li>
                      <li><b>No. of Layers:</b> ${cakeDesc.layers}</li>
                      <li><b>Shape:</b> ${cakeDesc.shapes}</li>
                    </ul>
                </div>
                <div class="col-4">
                    <button class="delete-cake btn btn-danger" id="delete-cake-${cakeDesc.id}" 
                    data-cake-id="${cakeDesc.id}" data-order-id="${orderDesc.id}">Delete</button>
                </div>
            </div>`)
        });
        return cakeHtml.join('');
    }

    static getNewCakeForm(orderDesc) {
        return `<div class="form-group" id="new-cake-form">
        <label for="new-cake-flavor-${orderDesc.id}">Flavor:</label><br>
        <div class="input-group">
            <select class="custom-select" id="new-cake-flavor-${orderDesc.id}">
            <option selected>Choose..</option>
            <option value="Vanilla">Vanilla</option>
            <option value="Chocolate">Chocolate</option>
            <option value="Lemon">Lemon</option>
            <option value="Red Velvet">Red Velvet</option>
            <option value="Carrot">Carrot</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label for="new-cake-frosting-${orderDesc.id}">Frosting:</label><br>
          <input class="form-control" type="text" id="new-cake-frosting-${orderDesc.id}" placeholder="Enter the color for your cake">
          </div>
          <div class="form-group">
            <label for="new-cake-layers-${orderDesc.id}">Number of Layers:</label><br>
            <div class="input-group">
            <select class="custom-select" id="new-cake-layers-${orderDesc.id}">
            <option selected>Choose..</option>
            <option value="One">One</option>
            <option value="Two">Two</option>
            <option value="Three">Three</option>
            </select>
            </div>
         </div>
         <div class="form-group">
          <label for="new-cake-shapes-${orderDesc.id}">Shape of Cake:</label><br>
          <div class="input-group">
          <select class="custom-select" id="new-cake-shapes-${orderDesc.id}">
          <option selected>Choose...</option>
          <option value="Square">Square</option>
          <option value="Circle">Circle</option>
          <option value="Rectangle">Rectangle</option>
          <option value="Bundt">Bundt</option>
          </select>
          </div>
          <br>
                <div id="add-cake" class="form-group">
                <button class="form-control btn" id="add-cake-for-order-${orderDesc.id}" data-order-id="${orderDesc.id}">Add New Cake</button>
                </div>`;
    }

    static getOrderBox(orderDesc) {
        let orderHeader = DOMManager.getOrderHeader(orderDesc);
        let addCakeForm = DOMManager.getNewCakeForm(orderDesc);
        let currentCakes = DOMManager.getCakeMarkupForOrder(orderDesc);
        return `<div class="card">
            <div class="card-header">
                ${orderHeader}
            </div>
            <div class="card-body">
                ${addCakeForm}
                ${currentCakes}
            </div>
        </div>`;
    }

    static render() {
        // Render the app div based on current state
        let newMarkup = currentState.map(this.getOrderBox);
        $('#app').html(newMarkup);
    }

    static init() {
        // Application initialization, event delegation hookups
        let $nameInput = $('#new-order-name');
        let $bakerInput = $('#baker-name');
        let $dateInput = $("#date-due");
    
        $('#create-new-order').on('click', () => {
            OrderService.addOrder(new Order(utils.getNewId(), $nameInput.val(), $bakerInput.val(), $dateInput.val()));
            updateState(OrderService.getAllOrders());
        });
    
        $('#app').on('click', (e) =>{
            // employing event delegation
            let $target = $(e.target);
            let targetId= $target.attr('id');
    
            if (!targetId) return;
            
            //Determining which of our buttons was clicked on by user + delegating an event to each of them
            if (targetId.startsWith('delete-order')) {
                let orderId = $target.data('orderId');
                OrderService.deleteOrder(orderId);
                updateState(OrderService.getAllOrders());
            } else if (targetId.startsWith('delete-cake')) {
                let orderId = $target.data('orderId');
                let cakeId = $target.data('cakeId');
                OrderService.deleteCake(orderId, cakeId);
                updateState(OrderService.getAllOrders());
            } else if (targetId.startsWith('add-cake-for-order')) {
                //How we will get the cake info we need to create a description of it
                let orderId = $target.data('orderId');
                let flavor = $(`#new-cake-flavor-${orderId}`).val();
                let frosting = $(`#new-cake-frosting-${orderId}`).val();
                let layers = $(`#new-cake-layers-${orderId}`).val();
                let shapes = $(`#new-cake-shapes-${orderId}`).val();
    
                //We will update the order with the new cake
                let orderToUpdate;
                currentState.forEach(order => {
                    if (order.id === orderId) {
                        order.addCake(flavor, frosting, layers, shapes);
                        orderToUpdate = order;
                    }
                });
                if (orderToUpdate) {
                    OrderService.updateOrder(orderToUpdate);
                    updateState(OrderService.getAllOrders());
                }
            }
        });
    
        updateState(OrderService.getAllOrders());
    }
}

// Application initialization

DOMManager.init();
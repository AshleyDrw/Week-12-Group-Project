
let utils = (function() {
    let ids = 0;
    function getNewId() {
        return ids++;
    }

    return { getNewId };
})();


class Cake {
    constructor(id, flavor, frosting, layers) {
        this.id = id;
        this.title = flavor;
        this.genre = frosting;
        this.pubYear = layers;
    }
}

class Order {
    constructor(id, name, baker, deliveryDate) {
        this.id = id;
        this.name = name;
        this.baker = baker;
        this.deliveryDate = deliveryDate;
        this.cakes = [];
    }

    
    addCake(flavor, frosting, layers) {
        this.cakes.push(new Cake(utils.getNewId(), flavor, frosting, layers));
    }

    
    removeCake(id) {
        let cakeToDeleteIdx = this.cakes.map(cake => cake.id).indexOf(id);
        if (cakeToDeleteIdx != -1) {
            this.cakes.splice(cakeToDeleteIdx, 1);
        }
    }
}


let orderRepo = [];


class OrderService {
   
    static getIdxForId(orderId) {
        
        return orderRepo.map(a => a.id).indexOf(orderId);
    }

    static getAllOrders() {
        return orderRepo;
    }

    static addOrder(order) {
        orderRepo.push(order);
    }

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


let currentState;   

function updateState(newState) {
    
    currentState = newState;
    DOMManager.render();
}


class DOMManager {
    static getOrderHeader(orderDesc) {
        return `<div>
                    <div class="row">
                        <div class="col-8">
                            <h3>${orderDesc.name} / Baker: ${orderDesc.baker} / Delivery Date: ${orderDesc.deliveryDate}</h3>
                        </div>
                        <div class="col-4">
                            <button class="delete-order btn btn-danger" 
                                id="delete-order-${orderDesc.id}" data-order-id="${orderDesc.id}">Delete Order</button>
                        </div>
                    </div>
                </div>`
    }

    static getCakeMarkupForOrder(orderDesc) {
        let cakeHtml = [];
        orderDesc.cakes.forEach(cakeDesc => {
            cakeHtml.push(`<div class="row">
                <div class="col-8">
                    <ul>
                        <li>Flavor: ${cakeDesc.flavor}</li>
                        <li>Frosting: ${cakeDesc.frosting}</li>
                        <li>Layers: ${cakeDesc.layers}</li>
                    </ul>
                </div>
                <div class="col-4">
                    <button class="delete-cake btn btn-danger" id="delete-cake-${cakeDesc.id}" 
                        data-cake-id="${cakeDesc.id}" data-order-id="${orderDesc.id}">Delete Cake</button>
                </div>
            </div>`)
        });
        return cakeHtml.join('');
    }

    static getNewCakeForm(orderDesc) {
        return `<div class="form-group">
                 <label for="new-cake-flavor-${orderDesc.id}">Flavor:</label><br>
                 <input class="form-control" type="text" id="new-cake-flavor-${orderDesc.id}">
                </div>
                <div class="form-group">
                 <label for="new-cake-frosting-${orderDesc.id}">Frosting:</label><br>
                 <input class="form-control" type="text" id="new-cake-flavor-${orderDesc.id}">
                </div>
                <div class="form-group">
                 <label for="new-cake-layers-${orderDesc.id}">Layers:</label><br>
                 <input class="form-control" type="text" id="new-cake-layers-${orderDesc.id}">
                </div>
                <div class="form-group">
                    <button class="form-control btn btn-primary" id="add-cake-for-order-${orderDesc.id}" data-order-id="${orderDesc.id}">Add New Cake</button>
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
        
        let newMarkup = currentState.map(this.getOrderBox);
        $('#app').html(newMarkup);
    }

    static init() {
        
        let $nameInput = $('#new-order-name');
        let $bakerInput = $('#new-order-baker');
        let $deliveryDateInput = $('#new-order-deliveryDate');
    
        $('#create-new-order').on('click', () => {
            OrderService.addOrder(new Order(utils.getNewId(), $nameInput.val(), $bakerInput.val(), $deliveryDateInput.val()));
            updateState(OrderService.getAllOrders());
        });
    
        $('#app').on('click', (e) =>{
            
            let $target = $(e.target);
            let targetId= $target.attr('id');
    
            if (!targetId) return;
    
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
                let orderId = $target.data('orderId');
                
                let flavor = $(`#new-cake-flavor-${orderId}`).val();
                let frosting = $(`#new-cake-frosting-${orderId}`).val();
                let layers = $(`#new-cake-layers-${orderId}`).val();
    
                
                let orderToUpdate;
                currentState.forEach(order => {
                    if (order.id === orderId) {
                        order.addCake(flavor, frosting, layers);
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


DOMManager.init();
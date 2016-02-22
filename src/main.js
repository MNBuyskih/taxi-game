class Game {
    constructor(cars, orders, selector) {
        this.fps = 60;
        this.canvas = new GameCanvas(selector);
        this.grid = new PF.Grid(this.canvas.width, this.canvas.height);
        this.cars = this.createList(cars, Car);
        this.orders = this.createList(orders, Order);

        _.each(this.orders, (order) => {
            order.randomDestination(this.canvas.width, this.canvas.height);
            this.findNearestCar(order);
        });

        this.step();
    }

    step() {
        this.request = requestAnimationFrame(() => this.timeout = setTimeout(() => this.step(), 1000 / this.fps));

        _.each(this.cars, (car) => {
            if (!car.path) return;
            let newStep = car.pathStep === undefined ? 0 : car.pathStep + 1;

            if (newStep >= car.path.length) {
                if (car.back) return car.redraw();
                car.goBack();
                newStep = 0;
            }

            car.pathStep = newStep;
            car.coordinates = car.path[newStep];
        });
    }

    createList(count, constructor) {
        return _.reduce(_.range(Math.max(count, 0)), (cars, index) => {
            let Temp = function () {
            };
            Temp.prototype = constructor.prototype;
            let inst = new Temp();

            let car = constructor.call(inst, index, this);
            car.setRandom(this.canvas.width, this.canvas.height);
            cars.push(car);
            return cars;
        }, []);
    }

    /**
     * @param {Order} order
     */
    findNearestCar(order) {
        let best = {}, distance;

        _.each(this.cars, (car) => {
            if (car.order) return;

            distance = car.coordinates.getDistance(order.coordinates);
            if (!best.distance || best.distance > distance) best = {car, distance};
        });

        if (best.car) best.car.order = order;
    }

    destruct() {
        this.cars = [];
        this.orders = [];
        this.grid = null;
        cancelAnimationFrame(this.request);
        clearTimeout(this.timeout);
        this.canvas.clear();
    }
}

class IGameObject {
    constructor(index, game) {
        this.index = index;
        this.game = game;
        this.dimensions = IGameObject.defaultDimensions();
        this.coordinates = IGameObject.defaultCoordinates();
        this.color = IGameObject.defaultColor();
    }

    setRandom(w, h) {
        this.coordinates = Coordinates.random(w, h);
    }

    set coordinates(newCoordinates) {
        this.game.canvas.setObject(this, newCoordinates);
        this._coordinates = newCoordinates;
    }

    get coordinates() {
        return this._coordinates || IGameObject.defaultCoordinates();
    }

    static defaultDimensions() {
        return new Dimensions(5, 5);
    }

    static defaultCoordinates() {
        return new Coordinates(0, 0);
    }

    static defaultColor() {
        return '#000';
    }
}

class Car extends IGameObject {
    constructor(index, game) {
        super(index, game);
        this.color = 'green';
    }

    redraw() {
        this.game.canvas.redraw(this);
    }

    goBack() {
        this.path = this.getPath(this._order.destination);
        this.back = true;
        this.order.taken();
    }

    set order(order) {
        this._order = order;
        this.color = 'red';
        this.path = this.getPath(this._order.coordinates);
    }

    get order() {
        return this._order;
    }

    getPath(destination) {
        return this.coordinates.getPath(destination);
    }
}

class Order extends IGameObject {
    constructor(index, game) {
        super(index, game);
        this.color = 'yellow';
    }

    randomDestination(w, h) {
        this.destination = Coordinates.random(w, h);
    }

    taken() {
        // очистить клетку
    }
}

class Coordinates {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static defaults() {
        return new Coordinates(0, 0);
    }

    static random(w, h) {
        return new Coordinates(_.random(0, w), _.random(0, h));
    }

    /**
     * @param {Coordinates} destination
     */
    getPath(destination) {
        let a = this;
        let b = destination;
        let lastPoint = new Coordinates(a.x, a.y);
        let path = [lastPoint];
        while (lastPoint.x !== b.x || lastPoint.y !== b.y) {
            lastPoint = new Coordinates(getPoint(lastPoint.x, b.x), getPoint(lastPoint.y, b.y));
            path.push(lastPoint);
        }

        return path;

        function getPoint(source, destination) {
            if (source == destination) return source;
            return source + (source > destination ? -1 : 1);
        }
    }

    getDistance(destination) {
        let x = this.x - destination.x;
        let y = this.y - destination.y;
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    }
}

class GameCanvas {
    constructor(selector) {
        this._canvas = $(selector).get(0);
        this._context = this._canvas.getContext('2d');
    }

    clear() {
        var coordinates = new Coordinates(0, 0);
        var dimensions = new Dimensions(this._canvas.width, this._canvas.height);
        this.clearRect(coordinates, dimensions);
    }

    /**
     * @param {Coordinates} coordinates
     * @param {Dimensions} dimensions
     */
    clearRect(coordinates, dimensions) {
        this._context.clearRect(coordinates.x, coordinates.y, dimensions.width, dimensions.height);
    }

    get width() {
        return this._canvas.width;
    }

    get height() {
        return this._canvas.height;
    }

    /**
     * @param {IGameObject} obj
     * @param {Coordinates} newCoordinates
     */
    setObject(obj, newCoordinates) {
        this.clearRect(obj.coordinates, obj.dimensions);
        this.drawRect(newCoordinates, obj.dimensions, obj.color);
    }

    /**
     * @param {IGameObject} obj
     */
    redraw(obj) {
        this.drawRect(obj.coordinates, obj.dimensions, obj.color);
    }

    /**
     * @param {Coordinates} coordinates
     * @param {Dimensions} dimensions
     * @param {String} color
     */
    drawRect(coordinates, dimensions, color) {
        this._context.fillStyle = color;
        this._context.fillRect(coordinates.x, coordinates.y, dimensions.width, dimensions.height);
    }
}

class Dimensions {
    constructor(w, h) {
        this.width = w;
        this.height = h;
    }
}

(function () {
    let game;
    $('#settings').on('submit', function (e) {
        e.preventDefault();
        if (game) game.destruct();
        game = createGame();
    });

    function createGame() {
        return new Game($('#cars').val(), $('#orders').val(), $('#canvas'));
    }
})();
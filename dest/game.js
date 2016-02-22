'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Game = function () {
    function Game(cars, orders, selector) {
        var _this = this;

        _classCallCheck(this, Game);

        this.fps = 60;
        this.canvas = new GameCanvas(selector);
        this.cars = this.createList(cars, Car);
        this.orders = this.createList(orders, Order);

        _.each(this.orders, function (order) {
            order.randomDestination(_this.canvas.width, _this.canvas.height);
            _this.findNearestCar(order);
        });

        this.step();
    }

    _createClass(Game, [{
        key: 'step',
        value: function step() {
            var _this2 = this;

            this.request = requestAnimationFrame(function () {
                return _this2.timeout = setTimeout(function () {
                    return _this2.step();
                }, 1000 / _this2.fps);
            });

            _.each(this.cars, function (car) {
                if (!car.path) return;
                var newStep = car.pathStep === undefined ? 0 : car.pathStep + 1;

                if (newStep >= car.path.length) {
                    if (car.back) return car.redraw();
                    car.goBack();
                    newStep = 0;
                }

                car.pathStep = newStep;
                car.coordinates = car.path[newStep];
            });
        }
    }, {
        key: 'createList',
        value: function createList(count, constructor) {
            var _this3 = this;

            return _.reduce(_.range(Math.max(count, 0)), function (cars, index) {
                var Temp = function Temp() {};
                Temp.prototype = constructor.prototype;
                var inst = new Temp();

                var car = constructor.call(inst, index, _this3);
                car.setRandom(_this3.canvas.width, _this3.canvas.height);
                cars.push(car);
                return cars;
            }, []);
        }

        /**
         * @param {Order} order
         */

    }, {
        key: 'findNearestCar',
        value: function findNearestCar(order) {
            var best = {},
                distance = undefined;

            _.each(this.cars, function (car) {
                if (car.order) return;

                distance = car.coordinates.getDistance(order.coordinates);
                if (!best.distance || best.distance > distance) best = { car: car, distance: distance };
            });

            if (best.car) best.car.order = order;
        }
    }, {
        key: 'destruct',
        value: function destruct() {
            this.cars = [];
            this.orders = [];
            this.grid = null;
            cancelAnimationFrame(this.request);
            clearTimeout(this.timeout);
            this.canvas.clear();
        }
    }]);

    return Game;
}();

var IGameObject = function () {
    function IGameObject(index, game) {
        _classCallCheck(this, IGameObject);

        this.index = index;
        this.game = game;
        this.dimensions = IGameObject.defaultDimensions();
        this.coordinates = IGameObject.defaultCoordinates();
        this.color = IGameObject.defaultColor();
    }

    _createClass(IGameObject, [{
        key: 'setRandom',
        value: function setRandom(w, h) {
            this.coordinates = Coordinates.random(w, h);
        }
    }, {
        key: 'coordinates',
        set: function set(newCoordinates) {
            this.game.canvas.setObject(this, newCoordinates);
            this._coordinates = newCoordinates;
        },
        get: function get() {
            return this._coordinates || IGameObject.defaultCoordinates();
        }
    }], [{
        key: 'defaultDimensions',
        value: function defaultDimensions() {
            return new Dimensions(5, 5);
        }
    }, {
        key: 'defaultCoordinates',
        value: function defaultCoordinates() {
            return new Coordinates(0, 0);
        }
    }, {
        key: 'defaultColor',
        value: function defaultColor() {
            return '#000';
        }
    }]);

    return IGameObject;
}();

var Car = function (_IGameObject) {
    _inherits(Car, _IGameObject);

    function Car(index, game) {
        _classCallCheck(this, Car);

        var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(Car).call(this, index, game));

        _this4.color = 'green';
        return _this4;
    }

    _createClass(Car, [{
        key: 'redraw',
        value: function redraw() {
            this.game.canvas.redraw(this);
        }
    }, {
        key: 'goBack',
        value: function goBack() {
            this.path = this.getPath(this._order.destination);
            this.back = true;
            this.order.taken();
        }
    }, {
        key: 'getPath',
        value: function getPath(destination) {
            return this.coordinates.getPath(destination);
        }
    }, {
        key: 'order',
        set: function set(order) {
            this._order = order;
            this.color = 'red';
            this.path = this.getPath(this._order.coordinates);
        },
        get: function get() {
            return this._order;
        }
    }]);

    return Car;
}(IGameObject);

var Order = function (_IGameObject2) {
    _inherits(Order, _IGameObject2);

    function Order(index, game) {
        _classCallCheck(this, Order);

        var _this5 = _possibleConstructorReturn(this, Object.getPrototypeOf(Order).call(this, index, game));

        _this5.color = 'yellow';
        return _this5;
    }

    _createClass(Order, [{
        key: 'randomDestination',
        value: function randomDestination(w, h) {
            this.destination = Coordinates.random(w, h);
        }
    }, {
        key: 'taken',
        value: function taken() {
            // очистить клетку
        }
    }]);

    return Order;
}(IGameObject);

var Coordinates = function () {
    function Coordinates(x, y) {
        _classCallCheck(this, Coordinates);

        this.x = x;
        this.y = y;
    }

    _createClass(Coordinates, [{
        key: 'getPath',


        /**
         * @param {Coordinates} destination
         */
        value: function getPath(destination) {
            var a = this;
            var b = destination;
            var lastPoint = new Coordinates(a.x, a.y);
            var path = [lastPoint];
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
    }, {
        key: 'getDistance',
        value: function getDistance(destination) {
            var x = this.x - destination.x;
            var y = this.y - destination.y;
            return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        }
    }], [{
        key: 'defaults',
        value: function defaults() {
            return new Coordinates(0, 0);
        }
    }, {
        key: 'random',
        value: function random(w, h) {
            return new Coordinates(_.random(0, w), _.random(0, h));
        }
    }]);

    return Coordinates;
}();

var GameCanvas = function () {
    function GameCanvas(selector) {
        _classCallCheck(this, GameCanvas);

        this._canvas = $(selector).get(0);
        this._context = this._canvas.getContext('2d');
    }

    _createClass(GameCanvas, [{
        key: 'clear',
        value: function clear() {
            var coordinates = new Coordinates(0, 0);
            var dimensions = new Dimensions(this._canvas.width, this._canvas.height);
            this.clearRect(coordinates, dimensions);
        }

        /**
         * @param {Coordinates} coordinates
         * @param {Dimensions} dimensions
         */

    }, {
        key: 'clearRect',
        value: function clearRect(coordinates, dimensions) {
            this._context.clearRect(coordinates.x, coordinates.y, dimensions.width, dimensions.height);
        }
    }, {
        key: 'setObject',


        /**
         * @param {IGameObject} obj
         * @param {Coordinates} newCoordinates
         */
        value: function setObject(obj, newCoordinates) {
            this.clearRect(obj.coordinates, obj.dimensions);
            this.drawRect(newCoordinates, obj.dimensions, obj.color);
        }

        /**
         * @param {IGameObject} obj
         */

    }, {
        key: 'redraw',
        value: function redraw(obj) {
            this.drawRect(obj.coordinates, obj.dimensions, obj.color);
        }

        /**
         * @param {Coordinates} coordinates
         * @param {Dimensions} dimensions
         * @param {String} color
         */

    }, {
        key: 'drawRect',
        value: function drawRect(coordinates, dimensions, color) {
            this._context.fillStyle = color;
            this._context.fillRect(coordinates.x, coordinates.y, dimensions.width, dimensions.height);
        }
    }, {
        key: 'width',
        get: function get() {
            return this._canvas.width;
        }
    }, {
        key: 'height',
        get: function get() {
            return this._canvas.height;
        }
    }]);

    return GameCanvas;
}();

var Dimensions = function Dimensions(w, h) {
    _classCallCheck(this, Dimensions);

    this.width = w;
    this.height = h;
};

(function () {
    var game = undefined;
    $('#settings').on('submit', function (e) {
        e.preventDefault();
        if (game) game.destruct();
        game = createGame();
    });

    function createGame() {
        return new Game($('#cars').val(), $('#orders').val(), $('#canvas'));
    }
})();

//# sourceMappingURL=game.js.map
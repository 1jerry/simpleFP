// some basic Functional Programming (FP) utilities

const map = fn => m => {
    if (!isFunction(fn)) {
        throw new TypeError(
            `map: Please provide a Function for the first argument`
        );
    }

    if (isFunction(m)) {
        return compose(
            fn,
            m
        );
    }

    if (isArray(m)) {
        return mapArray(fn, m);
    }

    if (isFunctor(m)) {
        return mapFunctor(fn, m);
    }

    if (isObject(m)) {
        return mapObj(fn, m);
    }

    throw new TypeError(
        `map: Please provide a Functor or Object for the second argument`
    );
};

// isArray :: a -> Bool
const isArray = x => Array.isArray(x);

// isFunction :: a -> Bool
const isFunction = x => typeof x === "function";

// isFunctor :: a -> Bool
const isFunctor = x => !!x && isFunction(x["map"]);

// isObject :: a -> Bool
const isObject = x =>
    !!x && Object.prototype.toString.call(x) === "[object Object]";

// mapArray :: ((a -> b), Array a) -> Array b
const mapArray = (fn, m) => m.map(x => fn(x));

// mapObj :: ((a -> b), { k: a }) -> { k: b }
const mapObj = (fn, m) => {
    const obj = {};

    for (const [k, v] of Object.entries(m)) {
        obj[k] = fn(v);
    }

    return obj;
};

// mapFunctor :: Functor f => ((a -> b), f a) -> f b
const mapFunctor = (fn, m) => m.map(fn);

const compose = (...funcs) =>
    initValue =>
        reduces(
            (funcResult, func) => func(funcResult),
            initValue,
            funcs.reverse()
        );

const curry = func => (...args) =>
    args.length < func.length
        ? (...moreArgs) => curry(func)(...args, ...moreArgs)
        : func(...args);

// less flexible functions
const reduces = (cb, initialValue, array) => {
    let result = initialValue;
    array.forEach(item =>
        result = cb.call(undefined, result, item, array));
    return result;
};
const reduce = curry(reduces)

const filter = func => array =>
    reduces((result, item) =>
        func(item) ? result.concat(item) : result, [], array);

const trace = label => (...value) => {
    console.log(label, ...value)
    return value.length === 1 ? value[0] : value
}
// I copied this from somewhere for some purpose, but I cannot remember what it does
function joint(a){var b;return b=a[a.length-1],a.pop(),a=a.length>1?joint(a):a[0],function(){b.apply(new a)}}

module.exports = {
    compose, curry, filter, map, reduce, trace
}


//
// quick tests / example if run from command line
//
const runningAsScript = !module.parent
if (runningAsScript) {
    let data = [
        {message: "one", enabled: true,},
        {message: "six", enabled: true, rtype: "B", states: ["WA", "OR"]},
        {message: "two", enabled: true, rtype: "S", states: ["WA", "OR"]},
        {message: "three", enabled: false, rtype: "S", states: ["WA", "OR"]},
        {message: "four", enabled: true, rtype: "S", states: ["OR"]},
        {message: "five", enabled: true, rtype: "B", states: ["WA", "OR"]},
        {message: "hive", enabled: false, rtype: "B", states: ["WA", "OR"]}
    ]
    const msg = trace('test output:')
    const check = trace('test result =')

    //
    // filter tests
    let filterEnabled = x => x.enabled
    let filterifB = x => x.rtype === "B"
    let filterBoth = x => filterifB(x) && filterEnabled(x)
    msg(data.length)
    f = filter(filterEnabled)
    f1 = filter(filterifB)
    f0 = filter(filterBoth)
    ch2 = trace('test result, filter ')
    ch2(f(data).length === 5)
    ch2(f1(data).length === 3)
    ch2(f0(data).length === 2)
    //
    // map tests
    let mapIf = x => {
        if (filterBoth(x)) x.ok = true
        return x
    }
    m0 = map(mapIf)
    check(m0(data).length === 7)
    // is the length of the resulting array the same as our above filter?
    let sofar = filter(x => x.ok)(data)
    check(sofar.length === 2)
    //
    // reduce tests
    let reduceCount = (obj, nxt) => obj + nxt.ok || 0
    r0 = reduce(reduceCount, 10)
    msg(r0(sofar))
    check('reduce', r0(sofar) === 12)
    //
    // compose() puts them all together
    const doAll = compose(
        trace("after reduce"),
        r0,
        map(trace("after map")),
        m0,
        map(trace("after filter")),
        f0
    )
    let result = msg(doAll(data))
    ""
}

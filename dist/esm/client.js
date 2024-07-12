function prepareClient({ routes, create, ...others }) {
    return { routes, create, ...others };
}

export { prepareClient as default };

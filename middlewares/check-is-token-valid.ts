const checkGoogleToken = (req: any, res: any, next: any) => {
    try {
        console.log(req.body);
        const sessionToken = req.get('Authorization');
        const accessToken = req.get('Cookies')

        console.log(accessToken);
        console.log('==============');
        console.log(sessionToken);
        
        next()
    } catch (e) {
        res.send(e.message);
        next(e)
    }
}

export {
    checkGoogleToken
}
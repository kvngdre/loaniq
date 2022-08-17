module.exports = async function(settingsDoc, alteration) {
    let test = {segment: "a", max: 150_000}
    console.log(alteration.loanMetrics)
    if(alteration.loanMetrics) {
        await settingsDoc.updateOne(alteration)
        await settingsDoc.save()

        return settingsDoc;
    };
};
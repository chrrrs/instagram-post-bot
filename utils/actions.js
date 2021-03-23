const clickButton = async (text, mount) => {
  const xpath = `//*[text()='${text}']`;
  var matchingElement = await mount.$x(xpath);

  if (matchingElement) await matchingElement[0].click();
};

const delay = () => Math.floor(Math.random() * 6 + 1) * 50;

module.exports = {
  clickButton,
  delay,
};

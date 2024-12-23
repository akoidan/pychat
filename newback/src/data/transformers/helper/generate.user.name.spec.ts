import {generateUserName} from '@/data/transformers/helper/generate.user.name';


describe("generateUserName", () => {
  it("should remove email domain", () => {
    expect(generateUserName("deathangel@gmail.com")).toEqual("deathangel");
  });

  it("should cut to 16 symbolx", () => {
    expect(generateUserName("deathangasdfasfasdfsadfasdfel@gmail.com")).toHaveLength(16);
  });
  it("should replace multiple invalid chars", () => {
    expect(generateUserName("f#8f))c@gmail.com")).toEqual("f-8f-c");
  });
});

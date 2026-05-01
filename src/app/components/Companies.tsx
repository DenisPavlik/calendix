import Image from "next/image";
import Marquee from "react-fast-marquee";

const logos = [
  {
    alt: "Lyft",
    src: "https://images.ctfassets.net/k0lk9kiuza3o/Y595RQBDR1fW5blQZfd9l/b9f3e2557c598b1ea51bb4e55f507833/lyft-customer-logo.svg",
  },
  {
    alt: "Compass",
    src: "https://images.ctfassets.net/k0lk9kiuza3o/6PFPRWMRMxRXthyXYcDRiR/ee7cc3f3ca0ed78752db06ce662a95f8/compass-customer-logo.svg",
  },
  {
    alt: "L'Oréal",
    src: "https://images.ctfassets.net/k0lk9kiuza3o/42drnxHfXrNOGKnVE9iA3r/a7f1bea3f67ca614e359eb6de12d8ba1/loreal-customer-logo.svg",
  },
  {
    alt: "Zendesk",
    src: "https://images.ctfassets.net/k0lk9kiuza3o/4AUQ47IN6ZBtXtWXt65L3D/24dae32ff49baaf8feecf9471804420d/zendesk-customer-logo.svg",
  },
  {
    alt: "Dropbox",
    src: "https://images.ctfassets.net/k0lk9kiuza3o/bOnLOncEyDdb8izczJggp/b98f4d8da30cfff0a87e8dce2bced46e/dropbox-customer-logo.svg",
  },
  {
    alt: "DoorDash",
    src: "https://images.ctfassets.net/k0lk9kiuza3o/6fo1ntHspDIwlAN45IgxRU/fbba98755d036e6d87631d0c5eccab25/doordash-customer-logo.svg",
  },
  {
    alt: "Crocs",
    src: "https://images.ctfassets.net/k0lk9kiuza3o/56cjEhKMIFlRPdVUSQqMYD/a33ef976df35d4e240246d5e08bcb610/crocs-customer-logo.svg",
  },
  {
    alt: "UT Austin",
    src: "https://images.ctfassets.net/k0lk9kiuza3o/2mrcuJTrXykG4Caan2TpE6/0661ed94e3fa2f1e19dba6b8a1e40f65/texas-ut-austin-customer-logo.svg",
  },
  {
    alt: "Ancestry",
    src: "https://images.ctfassets.net/k0lk9kiuza3o/6aSAknGku3oEB7jL7xEjLs/7004d26e48686e4a2b6e99348e1899fc/ancestry-customer-logo.svg",
  },
  {
    alt: "ClickUp",
    src: "https://images.ctfassets.net/k0lk9kiuza3o/1t4mL2cJruvAambU0hhBlA/37d38090e2283844cc368e6ec4633feb/clickup-customer-logo.svg",
  },
];

export default function Companies() {
  return (
    <section className="py-10 border-y border-gray-100">
      <p className="text-center text-xs font-medium text-gray-400 uppercase tracking-widest mb-6">
        Trusted by teams at
      </p>
      <Marquee speed={35} pauseOnHover autoFill gradient={false}>
        {logos.map((logo) => (
          <Image
            key={logo.alt}
            src={logo.src}
            alt={logo.alt}
            width={120}
            height={60}
            className="mx-10 h-7 w-auto opacity-50 hover:opacity-90 transition-opacity duration-300"
          />
        ))}
      </Marquee>
    </section>
  );
}

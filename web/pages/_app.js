import '../public/styles/css/all.min.css';
// import '../public/styles/css/custom.min.css';
import '../public/styles/css/responsive.css';
// import '../public/styles/css/new-html/custom.min.css';
import React, {useEffect, useState} from "react";
import AOS from 'aos';
import 'aos/dist/aos.css';
import Modal from 'react-modal';
import Script from 'next/script';
import Authentication from "../middleware/authentication";
import {useRouter} from "next/router";
import {initNav} from '../utils/nav-script'

// Request Prayer Work For Error Handling
Modal.setAppElement('#__next');

function MyApp({Component, pageProps}) {

    const router = useRouter()

    const [routePath, setRoutePath] = useState(null)
    const [isJquery, setIsJquery] = useState(false)
    const [isScrollTrigger, setIsScrollTrigger] = useState(false)

    // Animation Timing work
    useEffect(() => {
        AOS.init({
            duration: 1000,
            delay: 200,
        });
    }, []);

    useEffect(() => {
        if (routePath !== router.pathname && isJquery && isScrollTrigger) {
            setRoutePath(router.pathname)
            initNav()
        }
    }, [router, routePath, isJquery, isScrollTrigger])

    return (
        <>

            {/*<DynamicJSFiles/>*/}
            <Script
                src="https://code.jquery.com/jquery-3.6.0.min.js"
                onLoad={() => {
                    setIsJquery(true)
                }}
            />
            {isJquery ? (
                <>
                    <Script src="https://unpkg.com/swiper/swiper-bundle.min.js"/>
                    <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js"/>
                    <Script
                        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/ScrollTrigger.min.js"
                        onLoad={() => {
                            setIsScrollTrigger(true)
                        }}
                    />
                    {/*<Script src="/styles/js/all.min.js" />*/}
                    {/*<Script src="/styles/js/aos.js" />*/}
                    <Script src="/styles/js/gsap.js"/>
                    {/*<Script src="/styles/js/scrollTrigger.js" />*/}
                </>
            ) : null}
            {/*<Authentication>*/}
            <Component {...pageProps} />
            {/*</Authentication>*/}
        </>
    );
}

export default MyApp;

import type {Metadata} from 'next'
import {WebsiteShell} from '@/components/editorial/WebsiteShell'
import {ApprovedContact} from '@/components/editorial/ApprovedContact'
export const metadata:Metadata={title:'Contact | GigMiles',description:'Get help with GigMiles. Product support, account questions and legal or privacy inquiries.',alternates:{canonical:'https://gigmiles.app/contact'}}
export default function ContactPage(){return <WebsiteShell><ApprovedContact/><section className="wrap scope-note"><a className="text-link" href="/delete-account">Account deletion instructions →</a></section></WebsiteShell>}

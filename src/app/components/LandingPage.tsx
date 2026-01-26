import React, { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Sun, Zap, Shield, Users, Phone, Mail, MapPin, Check, Star, Award, Clock } from 'lucide-react';
import { publicAPI } from '@/app/utils/api';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onRegisterClick }) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, testimonialsData] = await Promise.all([
        publicAPI.getPlans(),
        publicAPI.getTestimonials(),
      ]);
      
      // Set default plans if none exist
      if (plansData.plans.length === 0) {
        setPlans([
          {
            capacity: '1kW',
            price: '₹60,000',
            subsidy: '₹30,000',
            finalPrice: '₹30,000',
            features: ['2-3 units/day', '25 years warranty', 'PM Surya Ghar subsidy eligible'],
          },
          {
            capacity: '2kW',
            price: '₹1,20,000',
            subsidy: '₹60,000',
            finalPrice: '₹60,000',
            features: ['8-10 units/day', '25 years warranty', 'PM Surya Ghar subsidy eligible'],
            popular: true,
          },
          {
            capacity: '3kW',
            price: '₹1,80,000',
            subsidy: '₹78,000',
            finalPrice: '₹1,02,000',
            features: ['12-15 units/day', '25 years warranty', 'PM Surya Ghar subsidy eligible'],
          },
        ]);
      } else {
        setPlans(plansData.plans);
      }

      // Set default testimonials if none exist
      if (testimonialsData.testimonials.length === 0) {
        setTestimonials([
          {
            name: 'Rajesh Kumar',
            location: 'Mumbai',
            rating: 5,
            comment: 'Excellent service! My electricity bill reduced by 80%. Highly recommend Orbit Green Power.',
          },
          {
            name: 'Priya Sharma',
            location: 'Pune',
            rating: 5,
            comment: 'Professional installation team. Got subsidy within 3 months. Very happy with the system.',
          },
          {
            name: 'Amit Patel',
            location: 'Ahmedabad',
            rating: 5,
            comment: 'Best investment I made. Quality panels from Waaree. Working perfectly for 2 years now.',
          },
        ]);
      } else {
        setTestimonials(testimonialsData.testimonials);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-green-600">Orbit Green Power Technology</h1>
                <p className="text-sm text-gray-600">Solar Panel Lava, Bij Billapasun Mukta Vha</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onLoginClick}>Login</Button>
              <Button onClick={onRegisterClick} className="bg-green-600 hover:bg-green-700">Register</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-200">100% Renewable Energy</Badge>
          <h2 className="text-5xl font-bold mb-6 text-gray-900">
            Solar Panel Lava, <br />
            <span className="text-green-600">Bij Billapasun Mukta Vha</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform sunlight into savings. Get premium solar solutions with government subsidies and 25-year warranty.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={onRegisterClick} className="bg-green-600 hover:bg-green-700">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.open('tel:+919876543210')}>
              <Phone className="mr-2 h-5 w-5" />
              Call Now
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">About Orbit Green Power Technology</h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We are a leading solar energy solutions provider committed to making clean energy accessible to everyone. 
              With years of experience and thousands of satisfied customers, we deliver quality, reliability, and excellence.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Award className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  To empower every home and business with sustainable solar energy, reducing carbon footprint and electricity costs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Star className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  A future where solar energy is the primary source of power, creating a cleaner and greener planet for generations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Our Values</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Quality, transparency, customer satisfaction, and environmental responsibility guide everything we do.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Our Services</h3>
            <p className="text-lg text-gray-600">Comprehensive solar solutions for all your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>On-Grid Solar System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Connect to the grid and save on electricity bills. Excess power feeds back to the grid, earning you credits.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm">Net metering available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm">Up to 90% bill reduction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm">Low maintenance</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Sun className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Residential Solar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Power your home with clean energy. Custom solutions designed for Indian households.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm">1kW to 10kW systems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm">Subsidy support included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm">25-year warranty</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Commercial & Industrial</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Large-scale solar installations for businesses, factories, and commercial complexes.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm">10kW to 1MW+ capacity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm">ROI in 3-5 years</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm">Tax benefits available</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Government Subsidy Section */}
      <section className="py-16 px-4 bg-green-50">
        <div className="container mx-auto">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-green-600 text-white">PM Surya Ghar Yojana</Badge>
              <h3 className="text-3xl font-bold mb-4">Government Subsidy Support</h3>
              <p className="text-lg text-gray-600">
                Get up to ₹78,000 subsidy on residential solar installations under PM Surya Ghar Muft Bijli Yojana
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <h4 className="text-2xl font-bold text-green-600 mb-2">₹30,000</h4>
                <p className="text-gray-600">Subsidy on 1kW system</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <h4 className="text-2xl font-bold text-green-600 mb-2">₹60,000</h4>
                <p className="text-gray-600">Subsidy on 2kW system</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <h4 className="text-2xl font-bold text-green-600 mb-2">₹78,000</h4>
                <p className="text-gray-600">Subsidy on 3kW+ system</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">We handle complete subsidy documentation and application process</p>
              <Button onClick={onRegisterClick} className="bg-green-600 hover:bg-green-700">
                Apply for Subsidy
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Why Choose Us?</h3>
            <p className="text-lg text-gray-600">Experience excellence in solar energy solutions</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>10+ Years Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Trusted expertise in solar installations</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>25 Years Warranty</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Comprehensive product and performance warranty</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Award className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Premium Brands</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Waaree, Adani, Vikram Solar certified products</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Skilled Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Certified engineers and technicians</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solar Plans Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Available Solar Plans</h3>
            <p className="text-lg text-gray-600">Choose the perfect solar system for your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-green-600 border-2 shadow-xl' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-green-600 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl text-green-600">{plan.capacity}</CardTitle>
                  <CardDescription>Solar System</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-gray-500 line-through text-sm">{plan.price}</div>
                    <div className="text-sm text-green-600 font-semibold">- {plan.subsidy} subsidy</div>
                    <div className="text-3xl font-bold text-gray-900 mt-2">{plan.finalPrice}</div>
                    <div className="text-sm text-gray-600">after subsidy</div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={onRegisterClick}>
                    Get Quote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Brands Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Our Partner Brands</h3>
            <p className="text-lg text-gray-600">We work with the best in the industry</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center max-w-4xl mx-auto">
            {['Waaree', 'Adani Solar', 'Vikram Solar', 'Growatt', 'Luminous', 'Havells', 'Tata Power Solar', 'RenewSys'].map((brand) => (
              <div key={brand} className="bg-white p-6 rounded-lg shadow-sm text-center">
                <p className="font-semibold text-gray-700">{brand}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Customer Testimonials</h3>
            <p className="text-lg text-gray-600">See what our satisfied customers say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic">"{testimonial.comment}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-green-600 text-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Contact Us</h3>
            <p className="text-lg">Get in touch with our solar experts</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardHeader>
                <Phone className="h-12 w-12 mb-4 mx-auto" />
                <CardTitle className="text-center">Phone</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-2">+91 98765 43210</p>
                <p>+91 87654 32109</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardHeader>
                <Mail className="h-12 w-12 mb-4 mx-auto" />
                <CardTitle className="text-center">Email</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-2">info@orbitgreenpower.com</p>
                <p>support@orbitgreenpower.com</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardHeader>
                <MapPin className="h-12 w-12 mb-4 mx-auto" />
                <CardTitle className="text-center">Address</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p>Green Energy Park,</p>
                <p>Solar City, Mumbai - 400001</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4 justify-center mt-12">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => window.open('https://wa.me/919876543210', '_blank')}
              className="bg-white text-green-600 hover:bg-gray-100"
            >
              WhatsApp Us
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => window.open('tel:+919876543210')}
              className="border-white text-white hover:bg-white/10"
            >
              <Phone className="mr-2 h-5 w-5" />
              Call Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sun className="h-6 w-6 text-green-400" />
            <h4 className="text-xl font-bold">Orbit Green Power Technology</h4>
          </div>
          <p className="text-gray-400 mb-4">Solar Panel Lava, Bij Billapasun Mukta Vha</p>
          <p className="text-gray-500 text-sm">
            © 2026 Orbit Green Power Technology. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
